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
    public ResponseEntity<?> showProjectDetails(@PathVariable("id") Long projectId) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to view details for non-existent project ID: {}", projectId);
            return ResponseEntity.notFound().build();
        }
        Project project = projectOptional.get();

        // Fetch and add tasks for this project
        List<Task> tasks = taskService.getTasksByProjectId(projectId);

        logger.debug("Displaying details for project ID: {} with {} tasks.", projectId, tasks.size());
        
        Map<String, Object> response = new HashMap<>();
        response.put("project", project);
        response.put("tasks", tasks);
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
}