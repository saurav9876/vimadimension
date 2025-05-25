// src/main/java/org/example/service/TimeTrackingService.java
package org.example.service;

import org.example.models.TimeEntry;
import org.example.repository.TimeEntryRepository;
import org.example.repository.TaskRepository; // To validate task existence
import org.example.repository.UserRepository; // To validate user existence
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For managing transactions

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service // Marks this as a Spring service component
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskRepository taskRepository; // Injected for validation
    private final UserRepository userRepository; // Injected for validation

    @Autowired // Constructor injection is preferred
    public TimeTrackingService(TimeEntryRepository timeEntryRepository,
                               TaskRepository taskRepository,
                               UserRepository userRepository) {
        this.timeEntryRepository = timeEntryRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional // Ensures the operation is atomic
    public TimeEntry addManualTimeEntry(Long taskId, Long userId, LocalDate dateOfWork, Duration duration, String description) {
        // Validate that the user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User with ID " + userId + " not found.");
        }
        // Validate that the task exists
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("Task with ID " + taskId + " not found.");
        }

        TimeEntry newEntry = new TimeEntry(taskId, userId, dateOfWork, duration, description);
        // The save method handles both creating new entities and updating existing ones.
        // It returns the persisted entity, which will include the database-generated ID.
        return timeEntryRepository.save(newEntry);
    }

    public Optional<TimeEntry> findTimeEntryById(Long entryId) {
        return timeEntryRepository.findById(entryId);
    }

    public List<TimeEntry> getTimeEntriesForUser(Long userId) {
        // Validate that the user exists before fetching their time entries
        if (!userRepository.existsById(userId)) {
            // Or you could return an empty list, depending on desired behavior
            throw new IllegalArgumentException("User with ID " + userId + " not found. Cannot fetch time entries.");
        }
        return timeEntryRepository.findByUserId(userId);
    }

    public List<TimeEntry> getTimeEntriesForTask(Long taskId) {
        // Validate that the task exists
        if (!taskRepository.existsById(taskId)) {
            throw new IllegalArgumentException("Task with ID " + taskId + " not found. Cannot fetch time entries.");
        }
        return timeEntryRepository.findByTaskId(taskId);
    }

    public List<TimeEntry> getTimeEntriesForUserOnDate(Long userId, LocalDate date) {
        Objects.requireNonNull(date, "Date cannot be null");
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User with ID " + userId + " not found. Cannot fetch time entries.");
        }
        return timeEntryRepository.findByUserIdAndDateOfWork(userId, date);
    }

    public List<TimeEntry> getTimeEntriesForUserInDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        Objects.requireNonNull(startDate, "Start date cannot be null");
        Objects.requireNonNull(endDate, "End date cannot be null");
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User with ID " + userId + " not found. Cannot fetch time entries.");
        }
        return timeEntryRepository.findByUserIdAndDateOfWorkBetween(userId, startDate, endDate);
    }

    public List<TimeEntry> getAllTimeEntries() {
        return timeEntryRepository.findAll();
    }

    @Transactional
    public Optional<TimeEntry> updateTimeEntry(Long entryId,
                                               Optional<LocalDate> newDateOfWork,
                                               Optional<Duration> newDuration,
                                               Optional<String> newDescription) {

        Optional<TimeEntry> entryOptional = timeEntryRepository.findById(entryId);
        if (entryOptional.isEmpty()) {
            return Optional.empty(); // Or throw an exception: TimeEntryNotFoundException
        }

        TimeEntry entryToUpdate = entryOptional.get();
        boolean updated = false;

        if (newDateOfWork.isPresent()) {
            entryToUpdate.setDateOfWork(newDateOfWork.get());
            updated = true;
        }
        if (newDuration.isPresent()) {
            entryToUpdate.setDurationSpent(newDuration.get());
            updated = true;
        }
        if (newDescription.isPresent()) {
            entryToUpdate.setDescription(newDescription.get());
            updated = true;
        }

        if (updated) {
            // The save method will update the existing entity because it has an ID
            return Optional.of(timeEntryRepository.save(entryToUpdate));
        }
        // If no fields were actually updated, return the original entity
        return Optional.of(entryToUpdate);
    }

    @Transactional
    public boolean deleteTimeEntry(Long entryId) {
        if (timeEntryRepository.existsById(entryId)) {
            timeEntryRepository.deleteById(entryId);
            return true;
        }
        return false; // Or throw an exception if the entry to delete is not found
    }
}