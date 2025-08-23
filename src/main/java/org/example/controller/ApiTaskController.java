package org.example.controller;

import org.example.dto.TimeLogDto;
import org.example.models.Task;
import org.example.models.TimeLog;
import org.example.service.TaskService;
import org.example.service.TimeLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class ApiTaskController {

    private static final Logger logger = LoggerFactory.getLogger(ApiTaskController.class);

    private final TaskService taskService;
    private final TimeLogService timeLogService;

    @Autowired
    public ApiTaskController(TaskService taskService, TimeLogService timeLogService) {
        this.taskService = taskService;
        this.timeLogService = timeLogService;
    }

    // Get task details
    @GetMapping("/{taskId}/details")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTaskDetails(@PathVariable Long taskId) {
        try {
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

            logger.info("Retrieved task details for task ID: {}", taskId);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            logger.error("Error getting task details for ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Log time for a task - This matches the frontend route: POST /api/tasks/{id}/timelogs
    @PostMapping("/{taskId}/timelogs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logTimeForTask(@PathVariable Long taskId,
                                          @RequestParam("hoursWorked") String hoursWorked,
                                          @RequestParam("description") String description,
                                          @RequestParam("dateLogged") String dateLogged) {
        logger.info("Received time log request for task {}: {} hours on {}", taskId, hoursWorked, dateLogged);

        try {
            // Verify task exists
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

            // Create TimeLogDto with proper field mapping
            TimeLogDto timeLogDto = new TimeLogDto();
            timeLogDto.setTaskId(taskId);
            timeLogDto.setHoursLogged(new BigDecimal(hoursWorked));
            timeLogDto.setWorkDescription(description);
            timeLogDto.setDateLogged(LocalDate.parse(dateLogged));

            TimeLog savedTimeLog = timeLogService.logTime(timeLogDto);
            logger.info("Time log created successfully for task {}: {} hours", taskId, savedTimeLog.getHoursLogged());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Time logged successfully!");
            response.put("timeLog", savedTimeLog);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error logging time for task ID {}: {}", taskId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Get time logs for a task
    @GetMapping("/{taskId}/timelogs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTimeLogsForTask(@PathVariable Long taskId) {
        try {
            // Verify task exists
            taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

            List<TimeLog> timeLogs = timeLogService.getTimeLogsForTask(taskId);
            logger.info("Retrieved {} time logs for task ID: {}", timeLogs.size(), taskId);
            
            // Log the first time log to debug serialization
            if (!timeLogs.isEmpty()) {
                TimeLog firstLog = timeLogs.get(0);
                logger.debug("First time log: ID={}, hours={}, date={}, taskId={}, userId={}", 
                           firstLog.getId(), firstLog.getHoursLogged(), firstLog.getDateLogged(),
                           firstLog.getTaskId(), firstLog.getUserId());
            }
            
            return ResponseEntity.ok(timeLogs);
        } catch (IllegalArgumentException e) {
            logger.error("Error getting time logs for task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting time logs for task ID {}: {}", taskId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // Update task
    @PostMapping("/{taskId}/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId,
                                      @RequestParam("name") String name,
                                      @RequestParam("description") String description,
                                      @RequestParam("projectStage") String projectStage,
                                      @RequestParam("status") String status) {
        logger.info("Received task update request for task {}: name='{}', projectStage='{}', status='{}'", 
                   taskId, name, projectStage, status);
        
        try {
            Task updatedTask = taskService.updateTask(taskId, name, description, projectStage, status);
            logger.info("Task ID {} updated successfully.", taskId);
            return ResponseEntity.ok(Map.of("message", "Task updated successfully!"));
        } catch (IllegalArgumentException e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
