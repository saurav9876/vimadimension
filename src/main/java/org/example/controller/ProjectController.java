package org.example.controller;

import org.example.dto.ProjectCreateDto;
import org.example.dto.ProjectUpdateDto;
import org.example.dto.TaskCreateDto;
import org.example.models.Project;
import org.example.models.Task;
import org.example.service.ProjectService;
import org.example.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import jakarta.validation.Valid; // For DTO validation
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;
    private final TaskService taskService;

    @Autowired
    public ProjectController(ProjectService projectService, TaskService taskService) {
        this.projectService = projectService;
        this.taskService = taskService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test database connection by trying to count projects
            long projectCount = projectService.findAllProjects().size();
            response.put("status", "healthy");
            response.put("database", "connected");
            response.put("projectCount", projectCount);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Health check failed: {}", e.getMessage(), e);
            response.put("status", "unhealthy");
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testPost(@RequestBody(required = false) Map<String, Object> requestBody) {
        logger.info("POST /projects/test endpoint hit!");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "POST endpoint is working");
        response.put("timestamp", System.currentTimeMillis());
        response.put("requestBody", requestBody);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Project>> listProjects(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to list projects");
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            logger.info("Attempting to list projects for user: {}", username);
            List<Project> projects = projectService.findProjectsByOrganization(username);
            logger.info("Successfully listed projects for user {}. Found: {} projects.", username, projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            logger.error("Error listing projects: {}", e.getMessage(), e);
            throw e; // Re-throw to see the full stack trace
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> listProjectsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to list paginated projects");
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            logger.info("Attempting to list paginated projects for user: {} (page: {}, size: {}, category: {}, priority: {}, status: {})", 
                       username, page, size, category, priority, status);
            
            Map<String, Object> response = projectService.findProjectsPaginatedAndFiltered(
                username, page, size, category, priority, status);
            
            logger.info("Successfully listed paginated projects for user {}. Found: {} projects on page {} of {}", 
                       username, response.get("totalItems"), page + 1, response.get("totalPages"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error listing paginated projects: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to retrieve projects"));
        }
    }

    @GetMapping("/new")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> showCreateProjectForm() {
        Map<String, Object> response = new HashMap<>();
        response.put("projectCreateDto", new ProjectCreateDto());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveProject(@ModelAttribute("projectCreateDto") ProjectCreateDto projectDto,
                              BindingResult result,
                              Authentication authentication) {
        logger.info("Received project creation request: {}", projectDto.getName());
        
        if (result.hasErrors()) {
            logger.warn("Validation errors: {}", result.getAllErrors());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated project creation attempt");
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated."));
        }
        String currentUsername = authentication.getName();
        logger.info("Creating project for user: {}", currentUsername);

        try {
            Project savedProject = projectService.createProject(projectDto, currentUsername);
            logger.info("Project created successfully: {}", savedProject.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project '" + savedProject.getName() + "' created successfully!");
            response.put("project", savedProject);
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            logger.error("User not found during project creation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Error: Creator user not found. " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating project: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Error creating project: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> showProjectDetails(@PathVariable("id") Long projectId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "12") int size) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to view details for non-existent project ID: {}", projectId);
            return ResponseEntity.notFound().build();
        }
        Project project = projectOptional.get();

        // Fetch and add tasks for this project with detailed information
        Map<String, Object> paginatedTasks;
        try {
            paginatedTasks = taskService.getTasksByProjectIdPaginated(projectId, page, size);
        } catch (IllegalArgumentException ex) {
            logger.warn("Invalid pagination parameters for project {} details: {}", projectId, ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", ex.getMessage(),
                    "projectId", projectId
            ));
        }
        @SuppressWarnings("unchecked")
        List<Task> tasks = (List<Task>) paginatedTasks.getOrDefault("tasks", List.of());
        List<Map<String, Object>> taskResponses = new ArrayList<>();
        
        for (Task task : tasks) {
            Map<String, Object> taskResponse = buildTaskResponse(task);
            taskResponses.add(taskResponse);
        }

        long totalItems = ((Number) paginatedTasks.getOrDefault("totalItems", tasks.size())).longValue();
        logger.debug("Displaying details for project ID: {} with {} tasks (page {}).", projectId, totalItems, paginatedTasks.getOrDefault("currentPage", page));
        
        Map<String, Object> response = new HashMap<>();
        response.put("project", project);
        response.put("tasks", taskResponses);
        Map<String, Object> paginationMetadata = new HashMap<>(paginatedTasks);
        paginationMetadata.remove("tasks");
        response.put("taskPagination", paginationMetadata);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/edit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> showUpdateProjectForm(@PathVariable("id") Long projectId) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to edit non-existent project ID: {}", projectId);
            return ResponseEntity.notFound().build();
        }

        Project project = projectOptional.get();
        ProjectUpdateDto projectUpdateDto = new ProjectUpdateDto();
        projectUpdateDto.setName(project.getName());
        projectUpdateDto.setClientName(project.getClientName());
        projectUpdateDto.setStartDate(project.getStartDate());
        projectUpdateDto.setEstimatedEndDate(project.getEstimatedEndDate());
        projectUpdateDto.setLocation(project.getLocation());
        projectUpdateDto.setProjectCategory(project.getProjectCategory());
        projectUpdateDto.setStatus(project.getStatus());
        projectUpdateDto.setProjectStage(project.getProjectStage());
        projectUpdateDto.setDescription(project.getDescription());
        projectUpdateDto.setBudget(project.getBudget());
        projectUpdateDto.setActualCost(project.getActualCost());
        projectUpdateDto.setPriority(project.getPriority());

        logger.debug("Displaying edit form for project ID: {}", projectId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("projectUpdateDto", projectUpdateDto);
        response.put("projectId", projectId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProject(@PathVariable("id") Long projectId,
                                @ModelAttribute("projectUpdateDto") ProjectUpdateDto projectUpdateDto,
                                BindingResult result) {

        if (result.hasErrors()) {
            logger.warn("Validation errors while updating project ID {}: {}", projectId, result.getAllErrors());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            projectService.updateProject(projectId, projectUpdateDto);
            logger.info("Project ID {} updated successfully.", projectId);
            return ResponseEntity.ok(Map.of("message", "Project updated successfully!"));
        } catch (IllegalArgumentException e) {
            logger.error("Error updating project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProject(@PathVariable("id") Long projectId) {
        try {
            boolean deleted = projectService.deleteProject(projectId);
            if (deleted) {
                logger.info("Project ID {} deleted successfully.", projectId);
                return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
            } else {
                logger.warn("Attempt to delete project ID {} failed, project not found or other issue.", projectId);
                return ResponseEntity.badRequest().body(Map.of("error", "Project not found or could not be deleted."));
            }
        } catch (IllegalStateException e) {
            logger.warn("Attempt to delete project ID {} failed: {}", projectId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting project: " + e.getMessage()));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            logger.error("Database constraint violation while deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Cannot delete project due to existing dependencies. Please ensure all related data is removed first."));
        } catch (Exception e) {
            logger.error("Unexpected error while deleting project ID {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred while deleting the project."));
        }
    }

    // Task creation endpoints
    @PostMapping("/{projectId}/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createTask(@PathVariable Long projectId,
                                      @ModelAttribute TaskCreateDto taskCreateDto,
                                      BindingResult result) {
        logger.info("Received task creation request for project {}: name='{}', description='{}'", 
                   projectId, taskCreateDto.getName(), taskCreateDto.getDescription());
        
        if (result.hasErrors()) {
            logger.warn("Validation errors in task creation: {}", result.getAllErrors());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            Project project = projectService.findById(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + projectId));
            
            logger.info("Creating task with name: '{}' for project: {}", taskCreateDto.getName(), projectId);
            
            taskService.createTask(
                    taskCreateDto.getName(),
                    taskCreateDto.getDescription(),
                    taskCreateDto.getProjectStage(),
                    projectId,
                    Optional.ofNullable(taskCreateDto.getAssigneeId()),
                    Optional.ofNullable(taskCreateDto.getCheckedById())
            );
            return ResponseEntity.ok(Map.of("message", "Task created successfully!"));
        } catch (IllegalArgumentException e) {
            logger.error("Error creating task for project ID {}: {}", projectId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Helper method to build a task response with all related information
     */
    private Map<String, Object> buildTaskResponse(Task task) {
        Map<String, Object> taskResponse = new HashMap<>();
        taskResponse.put("id", task.getId());
        taskResponse.put("name", task.getName());
        taskResponse.put("description", task.getDescription());
        taskResponse.put("status", task.getStatus());
        taskResponse.put("projectStage", task.getProjectStage());
        taskResponse.put("priority", task.getPriority());
        taskResponse.put("dueDate", task.getDueDate());
        taskResponse.put("createdAt", task.getCreatedAt());
        taskResponse.put("updatedAt", task.getUpdatedAt());
        
        // Add project information
        if (task.getProject() != null) {
            Map<String, Object> projectInfo = new HashMap<>();
            projectInfo.put("id", task.getProject().getId());
            projectInfo.put("name", task.getProject().getName());
            projectInfo.put("clientName", task.getProject().getClientName());
            taskResponse.put("project", projectInfo);
        }
        
        // Add assignee information
        if (task.getAssignee() != null) {
            Map<String, Object> assigneeInfo = new HashMap<>();
            assigneeInfo.put("id", task.getAssignee().getId());
            assigneeInfo.put("username", task.getAssignee().getUsername());
            assigneeInfo.put("name", task.getAssignee().getName());
            assigneeInfo.put("email", task.getAssignee().getEmail());
            taskResponse.put("assignee", assigneeInfo);
        }
        
        // Add reporter information
        if (task.getReporter() != null) {
            Map<String, Object> reporterInfo = new HashMap<>();
            reporterInfo.put("id", task.getReporter().getId());
            reporterInfo.put("username", task.getReporter().getUsername());
            reporterInfo.put("name", task.getReporter().getName());
            reporterInfo.put("email", task.getReporter().getEmail());
            taskResponse.put("reporter", reporterInfo);
        }
        
        // Add checked by information
        if (task.getCheckedBy() != null) {
            Map<String, Object> checkedByInfo = new HashMap<>();
            checkedByInfo.put("id", task.getCheckedBy().getId());
            checkedByInfo.put("username", task.getCheckedBy().getUsername());
            checkedByInfo.put("name", task.getCheckedBy().getName());
            checkedByInfo.put("email", task.getCheckedBy().getEmail());
            taskResponse.put("checkedBy", checkedByInfo);
        }
        
        return taskResponse;
    }
}
