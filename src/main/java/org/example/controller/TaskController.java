package org.example.controller;

import org.example.models.Task;
import org.example.models.enums.TaskStatus;
import org.example.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.example.dto.TimeLogDto;
import org.example.service.TimeLogService;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;
    private final TimeLogService timeLogService;

    @Autowired
    public TaskController(TaskService taskService, TimeLogService timeLogService) {
        this.taskService = taskService;
        this.timeLogService = timeLogService;
    }

    @GetMapping("/{taskId}/details")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getTaskDetails(@PathVariable Long taskId) {
        try {
            Optional<Task> taskOptional = taskService.findTaskById(taskId);
            if (taskOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found");
                return ResponseEntity.notFound().build();
            }

            Task task = taskOptional.get();
            
            // Build a detailed response that includes related entities
            Map<String, Object> taskDetails = new HashMap<>();
            taskDetails.put("id", task.getId());
            taskDetails.put("name", task.getName());
            taskDetails.put("description", task.getDescription());
            taskDetails.put("status", task.getStatus());
            taskDetails.put("projectStage", task.getProjectStage());
            taskDetails.put("priority", task.getPriority());
            taskDetails.put("dueDate", task.getDueDate());
            taskDetails.put("createdAt", task.getCreatedAt());
            taskDetails.put("updatedAt", task.getUpdatedAt());
            
            // Add project information
            if (task.getProject() != null) {
                Map<String, Object> projectInfo = new HashMap<>();
                projectInfo.put("id", task.getProject().getId());
                projectInfo.put("name", task.getProject().getName());
                projectInfo.put("clientName", task.getProject().getClientName());
                taskDetails.put("project", projectInfo);
            }
            
            // Add assignee information
            if (task.getAssignee() != null) {
                Map<String, Object> assigneeInfo = new HashMap<>();
                assigneeInfo.put("id", task.getAssignee().getId());
                assigneeInfo.put("username", task.getAssignee().getUsername());
                assigneeInfo.put("name", task.getAssignee().getName());
                assigneeInfo.put("email", task.getAssignee().getEmail());
                taskDetails.put("assignee", assigneeInfo);
            }
            
            // Add reporter information
            if (task.getReporter() != null) {
                Map<String, Object> reporterInfo = new HashMap<>();
                reporterInfo.put("id", task.getReporter().getId());
                reporterInfo.put("username", task.getReporter().getUsername());
                reporterInfo.put("name", task.getReporter().getName());
                reporterInfo.put("email", task.getReporter().getEmail());
                taskDetails.put("reporter", reporterInfo);
            }
            
            // Add checked by information
            if (task.getCheckedBy() != null) {
                Map<String, Object> checkedByInfo = new HashMap<>();
                checkedByInfo.put("id", task.getCheckedBy().getId());
                checkedByInfo.put("username", task.getCheckedBy().getUsername());
                checkedByInfo.put("name", task.getCheckedBy().getName());
                checkedByInfo.put("email", task.getCheckedBy().getEmail());
                taskDetails.put("checkedBy", checkedByInfo);
            }
            
            // Add time logs
            taskDetails.put("timeLogs", task.getTimeLogs());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("task", taskDetails);
            
            logger.info("Retrieved task details for task ID: {}", taskId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving task details for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve task details");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getAllTasks() {
        try {
            List<Task> tasks = taskService.getAllTasks();
            logger.info("Retrieved {} tasks", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error retrieving all tasks: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/paginated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAllTasksPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Map<String, Object> response = taskService.getAllTasksPaginated(page, size);
            logger.info("Retrieved paginated tasks - page: {}, size: {}, total: {}", 
                       page, size, response.get("totalElements"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving paginated tasks: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/assigned-to-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksAssignedToCurrentUser() {
        try {
            List<Task> tasks = taskService.getTasksAssignedToCurrentUser();
            logger.info("Retrieved {} tasks assigned to current user", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error retrieving tasks assigned to current user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/reported-by-me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksReportedByCurrentUser() {
        try {
            List<Task> tasks = taskService.getTasksReportedByCurrentUser();
            logger.info("Retrieved {} tasks reported by current user", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error retrieving tasks reported by current user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/to-check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Task>> getTasksToCheckByCurrentUser() {
        try {
            List<Task> tasks = taskService.getTasksToCheckByCurrentUser();
            logger.info("Retrieved {} tasks to check by current user", tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            logger.error("Error retrieving tasks to check by current user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/{taskId}/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId,
                                       @RequestParam("name") String name,
                                       @RequestParam("description") String description,
                                       @RequestParam("projectStage") String projectStage,
                                       @RequestParam("status") String status,
                                       @RequestParam("priority") String priority,
                                       @RequestParam(value = "dueDate", required = false) String dueDate,
                                       @RequestParam(value = "assigneeId", required = false) String assigneeId,
                                       @RequestParam(value = "checkedById", required = false) String checkedById) {
        try {
            // Convert assigneeId to Long if provided
            Long assigneeIdLong = null;
            if (assigneeId != null && !assigneeId.isEmpty()) {
                assigneeIdLong = Long.valueOf(assigneeId);
            }

            // Convert checkedById to Long if provided
            Long checkedByIdLong = null;
            if (checkedById != null && !checkedById.isEmpty()) {
                checkedByIdLong = Long.valueOf(checkedById);
            }

            Task updatedTask = taskService.updateTaskComplete(taskId, name, description, projectStage, status, priority, dueDate, assigneeIdLong, checkedByIdLong);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Task updated successfully");
            response.put("task", updatedTask);
            
            logger.info("Updated task ID: {}", taskId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update task");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                             @RequestBody Map<String, String> statusRequest) {
        try {
            String statusStr = statusRequest.get("status");
            if (statusStr == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Status is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            TaskStatus status = TaskStatus.valueOf(statusStr);
            Optional<Task> updatedTask = taskService.updateTaskStatus(taskId, status);
            
            if (updatedTask.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Task status updated successfully");
                response.put("task", updatedTask.get());
                
                logger.info("Updated status for task ID: {} to {}", taskId, status);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found");
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            logger.error("Error updating task status for task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Error updating task status for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update task status");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{taskId}/mark-checked")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markTaskAsChecked(@PathVariable Long taskId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<Task> updatedTask = taskService.markTaskAsCompletedAndChecked(taskId, username);
            
            if (updatedTask.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Task marked as checked successfully");
                response.put("task", updatedTask.get());
                
                logger.info("Marked task ID: {} as checked by user: {}", taskId, username);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Task not found or you are not authorized to check this task");
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            logger.error("Error marking task as checked for task ID {}: {}", taskId, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Error marking task as checked for task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to mark task as checked");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        try {
            boolean deleted = taskService.deleteTask(taskId);
            Map<String, Object> response = new HashMap<>();
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Task deleted successfully");
                logger.info("Deleted task ID: {}", taskId);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting task ID {}: {}", taskId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete task");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // --- REST API endpoint for creating time logs ---
    @PostMapping("/{taskId}/timelogs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTimeLog(@PathVariable Long taskId,
                                         @RequestParam("hoursWorked") Double hoursWorked,
                                         @RequestParam("description") String description,
                                         @RequestParam("dateLogged") String dateLogged) {
        try {
            // Validate task exists
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

            // Create TimeLogDto
            TimeLogDto timeLogDto = new TimeLogDto();
            timeLogDto.setTaskId(taskId);
            timeLogDto.setHoursLogged(BigDecimal.valueOf(hoursWorked));
            timeLogDto.setWorkDescription(description);
            timeLogDto.setDateLogged(java.time.LocalDate.parse(dateLogged));

            // Save time log
            timeLogService.logTime(timeLogDto);

            return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Time logged successfully"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error creating time log for task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error creating time log for task ID {}: {}", taskId, e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "error", "Internal server error"));
        }
    }
}