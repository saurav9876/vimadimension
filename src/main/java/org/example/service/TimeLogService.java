package org.example.service;

import org.example.dto.TimeLogDto;
import org.example.models.Task;
import org.example.models.TimeLog;
import org.example.models.User;
import org.example.repository.TaskRepository;
import org.example.repository.TimeLogRepository;
import org.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TimeLogService {

    private static final Logger logger = LoggerFactory.getLogger(TimeLogService.class);

    private final TimeLogRepository timeLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public TimeLogService(TimeLogRepository timeLogRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.timeLogRepository = timeLogRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Helper method to get the currently authenticated user.
     * @return The authenticated User entity.
     * @throws IllegalStateException if the authenticated user cannot be found in the database or is not authenticated.
     */
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found or user is anonymous.");
        }
        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user '" + username + "' not found in database."));
    }

    /**
     * Logs time for a specific task.
     *
     * @param timeLogDto DTO containing the details of the time to log.
     * @return The created TimeLog entity.
     * @throws IllegalArgumentException if task is not found or input is invalid.
     * @throws IllegalStateException if no authenticated user is found.
     */
    @Transactional
    public TimeLog logTime(TimeLogDto timeLogDto) {
        if (timeLogDto == null) {
            throw new IllegalArgumentException("Time log data cannot be null.");
        }
        if (timeLogDto.getTaskId() == null) {
            throw new IllegalArgumentException("Task ID cannot be null for logging time.");
        }
        if (timeLogDto.getHoursLogged() == null || timeLogDto.getHoursLogged().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hours logged must be a positive value.");
        }
        if (timeLogDto.getDateLogged() == null) {
            throw new IllegalArgumentException("Date logged cannot be null.");
        }
        if (timeLogDto.getWorkDescription() == null || timeLogDto.getWorkDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Work description cannot be empty.");
        }


        User currentUser = getCurrentAuthenticatedUser();
        Task task = taskRepository.findById(timeLogDto.getTaskId())
                .orElseThrow(() -> {
                    logger.warn("Attempt to log time for non-existent task with ID: {}", timeLogDto.getTaskId());
                    return new IllegalArgumentException("Task with ID " + timeLogDto.getTaskId() + " not found.");
                });

        TimeLog newTimeLog = new TimeLog();
        newTimeLog.setTask(task);
        newTimeLog.setUser(currentUser);
        newTimeLog.setDateLogged(timeLogDto.getDateLogged());
        newTimeLog.setHoursLogged(timeLogDto.getHoursLogged());
        newTimeLog.setWorkDescription(timeLogDto.getWorkDescription().trim());
        // createdAt is handled by @PrePersist in TimeLog entity

        TimeLog savedTimeLog = timeLogRepository.save(newTimeLog);
        logger.info("User '{}' logged {} hours for task '{}' (ID: {}) on {}",
                currentUser.getUsername(),
                savedTimeLog.getHoursLogged(),
                task.getName(),
                task.getId(),
                savedTimeLog.getDateLogged());
        return savedTimeLog;
    }

    public Optional<TimeLog> findTimeLogById(Long timeLogId) {
        return timeLogRepository.findById(timeLogId);
    }

    public List<TimeLog> getTimeLogsForTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            logger.warn("Attempt to get time logs for non-existent task ID: {}", taskId);
            // Or throw an exception, or return empty list based on desired behavior
            return List.of();
        }
        return timeLogRepository.findByTask_Id(taskId);
    }

    public List<TimeLog> getTimeLogsForCurrentUser() {
        User currentUser = getCurrentAuthenticatedUser();
        return timeLogRepository.findByUser_Id(currentUser.getId());
    }

    public List<TimeLog> getTimeLogsForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            logger.warn("Attempt to get time logs for non-existent user ID: {}", userId);
            return List.of();
        }
        return timeLogRepository.findByUser_Id(userId);
    }

    /**
     * Updates an existing time log.
     * Only the user who created the log can update it.
     *
     * @param timeLogId  The ID of the time log to update.
     * @param timeLogDto DTO containing the updated details.
     * @return The updated TimeLog entity.
     * @throws IllegalArgumentException if input is invalid or time log not found.
     * @throws IllegalStateException    if the current user is not authorized to update the log.
     */
    @Transactional
    public TimeLog updateTimeLog(Long timeLogId, TimeLogDto timeLogDto) {
        if (timeLogDto == null) {
            throw new IllegalArgumentException("Time log update data cannot be null.");
        }

        TimeLog existingTimeLog = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to update non-existent time log with ID: {}", timeLogId);
                    return new IllegalArgumentException("Time log with ID " + timeLogId + " not found.");
                });

        User currentUser = getCurrentAuthenticatedUser();
        if (!existingTimeLog.getUser().getId().equals(currentUser.getId())) {
            logger.warn("User '{}' (ID: {}) attempted to update time log ID: {} owned by user ID: {}",
                    currentUser.getUsername(), currentUser.getId(), timeLogId, existingTimeLog.getUser().getId());
            throw new IllegalStateException("You are not authorized to update this time log.");
        }

        boolean updated = false;

        if (timeLogDto.getDateLogged() != null && !timeLogDto.getDateLogged().equals(existingTimeLog.getDateLogged())) {
            existingTimeLog.setDateLogged(timeLogDto.getDateLogged());
            updated = true;
        }
        if (timeLogDto.getHoursLogged() != null && timeLogDto.getHoursLogged().compareTo(BigDecimal.ZERO) > 0 &&
                timeLogDto.getHoursLogged().compareTo(existingTimeLog.getHoursLogged()) != 0) {
            existingTimeLog.setHoursLogged(timeLogDto.getHoursLogged());
            updated = true;
        }
        if (timeLogDto.getWorkDescription() != null && !timeLogDto.getWorkDescription().trim().isEmpty() &&
                !timeLogDto.getWorkDescription().trim().equals(existingTimeLog.getWorkDescription())) {
            existingTimeLog.setWorkDescription(timeLogDto.getWorkDescription().trim());
            updated = true;
        }
        // Task ID is generally not updatable for a time log. If it needs to change,
        // it's often better to delete and re-create.

        if (updated) {
            TimeLog savedTimeLog = timeLogRepository.save(existingTimeLog);
            logger.info("Time log ID: {} updated by user '{}'", savedTimeLog.getId(), currentUser.getUsername());
            return savedTimeLog;
        }
        return existingTimeLog; // Return existing if no changes were made
    }

    /**
     * Deletes a time log.
     * Only the user who created the log can delete it.
     *
     * @param timeLogId The ID of the time log to delete.
     * @throws IllegalArgumentException if time log not found.
     * @throws IllegalStateException    if the current user is not authorized to delete the log.
     */
    @Transactional
    public void deleteTimeLog(Long timeLogId) {
        TimeLog timeLogToDelete = timeLogRepository.findById(timeLogId)
                .orElseThrow(() -> {
                    logger.warn("Attempt to delete non-existent time log with ID: {}", timeLogId);
                    return new IllegalArgumentException("Time log with ID " + timeLogId + " not found.");
                });

        User currentUser = getCurrentAuthenticatedUser();
        if (!timeLogToDelete.getUser().getId().equals(currentUser.getId())) {
            logger.warn("User '{}' (ID: {}) attempted to delete time log ID: {} owned by user ID: {}",
                    currentUser.getUsername(), currentUser.getId(), timeLogId, timeLogToDelete.getUser().getId());
            throw new IllegalStateException("You are not authorized to delete this time log.");
        }

        timeLogRepository.delete(timeLogToDelete);
        logger.info("Time log ID: {} deleted by user '{}'", timeLogId, currentUser.getUsername());
    }
}