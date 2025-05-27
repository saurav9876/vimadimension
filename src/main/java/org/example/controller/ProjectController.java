package org.example.controller;

import org.example.dto.ProjectCreateDto;
import org.example.dto.ProjectUpdateDto;
import org.example.models.Project;
// import org.example.models.Task; // Uncomment if you plan to list tasks on project details
import org.example.models.Task;
import org.example.service.ProjectService;
// import org.example.service.TaskService; // Uncomment if you need to fetch tasks
import org.example.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
// import jakarta.validation.Valid; // For DTO validation
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/projects")
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;
    private final TaskService taskService; // Inject if you want to show tasks on project detail page

    @Autowired
    public ProjectController(ProjectService projectService, TaskService taskService) {
        this.projectService = projectService;
        this.taskService = taskService;
    }

    @GetMapping
    public String listProjects(Model model) {
        List<Project> projects = projectService.findAllProjects(); // Updated method name
        model.addAttribute("projects", projects);
        logger.info("Listing all projects. Found: {} projects.", projects.size());
        return "projects/list-projects"; // Assumes src/main/resources/templates/projects/list-projects.html
    }

    @GetMapping("/new")
    @PreAuthorize("isAuthenticated()")
    public String showCreateProjectForm(Model model) {
        // Change the attribute name to "project"
        model.addAttribute("project", new ProjectCreateDto());
        logger.debug("Displaying form to create a new project.");
        return "projects/create-project-form";
    }

    @PostMapping("/create") // Changed from just @PostMapping to be more explicit
    @PreAuthorize("isAuthenticated()")
    public String createProject(
            // @Valid @ModelAttribute("projectCreateDto") ProjectCreateDto projectCreateDto, // Uncomment for validation
            @ModelAttribute("projectCreateDto") ProjectCreateDto projectCreateDto,
            BindingResult result,
            RedirectAttributes redirectAttributes) {

        if (result.hasErrors()) {
            logger.warn("Validation errors while creating project: {}", result.getAllErrors());
            // If using @Valid, the DTO with errors is already in the model.
            // No need to add projectCreateDto again unless you clear it.
            return "projects/create-project-form"; // Return to form to show errors
        }

        try {
            Project createdProject = projectService.createProject(projectCreateDto);
            redirectAttributes.addFlashAttribute("successMessage", "Project '" + createdProject.getName() + "' created successfully!");
            logger.info("Project created successfully with ID: {} and name: {}", createdProject.getId(), createdProject.getName());
            return "redirect:/projects";
        } catch (IllegalArgumentException e) {
            logger.error("Error creating project: {}", e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            // Add the DTO back to the model to repopulate the form with entered values
            // model.addAttribute("projectCreateDto", projectCreateDto); // Not needed if @ModelAttribute handles it
            return "redirect:/projects/new"; // Redirect back to the form, error message will be shown
        }
    }


    @GetMapping("/{id}/details")
    public String showProjectDetails(@PathVariable("id") Long projectId, Model model, RedirectAttributes redirectAttributes) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to view details for non-existent project ID: {}", projectId);
            redirectAttributes.addFlashAttribute("errorMessage", "Project not found.");
            return "redirect:/projects";
        }
        Project project = projectOptional.get();
        model.addAttribute("project", project);

        // Fetch and add tasks for this project
        List<Task> tasks = taskService.getTasksByProjectId(projectId);
        model.addAttribute("tasks", tasks);

        logger.debug("Displaying details for project ID: {} with {} tasks.", projectId, tasks.size());
        return "projects/project-details"; // Path to the HTML file above
    }

    @GetMapping("/{id}/edit")
    @PreAuthorize("isAuthenticated()")
    public String showUpdateProjectForm(@PathVariable("id") Long projectId, Model model, RedirectAttributes redirectAttributes) {
        Optional<Project> projectOptional = projectService.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to edit non-existent project ID: {}", projectId);
            redirectAttributes.addFlashAttribute("errorMessage", "Project not found.");
            return "redirect:/projects";
        }

        Project project = projectOptional.get();
        ProjectUpdateDto projectUpdateDto = new ProjectUpdateDto();
        projectUpdateDto.setName(project.getName());
        projectUpdateDto.setDescription(project.getDescription());

        model.addAttribute("projectUpdateDto", projectUpdateDto);
        model.addAttribute("projectId", projectId); // To construct the form action URL
        logger.debug("Displaying edit form for project ID: {}", projectId);
        return "projects/project-edit-form"; // Assumes src/main/resources/templates/projects/project-edit-form.html
    }

    @PostMapping("/{id}/update")
    @PreAuthorize("isAuthenticated()")
    public String updateProject(@PathVariable("id") Long projectId,
                                // @Valid @ModelAttribute("projectUpdateDto") ProjectUpdateDto projectUpdateDto, // Uncomment for validation
                                @ModelAttribute("projectUpdateDto") ProjectUpdateDto projectUpdateDto,
                                BindingResult result,
                                RedirectAttributes redirectAttributes,
                                Model model) { // Added Model for re-displaying form on error

        if (result.hasErrors()) {
            logger.warn("Validation errors while updating project ID {}: {}", projectId, result.getAllErrors());
            model.addAttribute("projectId", projectId); // Keep projectId for the form action
            // projectUpdateDto is already in model due to @ModelAttribute
            return "projects/project-edit-form";
        }

        try {
            projectService.updateProject(projectId, projectUpdateDto);
            redirectAttributes.addFlashAttribute("successMessage", "Project updated successfully!");
            logger.info("Project ID {} updated successfully.", projectId);
            return "redirect:/projects/" + projectId + "/details";
        } catch (IllegalArgumentException e) {
            logger.error("Error updating project ID {}: {}", projectId, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            // To repopulate the form with the submitted (but failed) data and show errors
            // model.addAttribute("projectUpdateDto", projectUpdateDto); // Already in model
            // model.addAttribute("projectId", projectId);
            // return "projects/project-edit-form";
            return "redirect:/projects/" + projectId + "/edit"; // Redirect back to edit form
        }
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("isAuthenticated()") // Consider more specific authorization (e.g., project owner/admin)
    public String deleteProject(@PathVariable("id") Long projectId, RedirectAttributes redirectAttributes) {
        try {
            boolean deleted = projectService.deleteProject(projectId);
            if (deleted) {
                redirectAttributes.addFlashAttribute("successMessage", "Project deleted successfully.");
                logger.info("Project ID {} deleted successfully.", projectId);
            } else {
                // This case might not be reached if service throws exception for not found
                redirectAttributes.addFlashAttribute("errorMessage", "Project not found or could not be deleted.");
                logger.warn("Attempt to delete project ID {} failed, project not found or other issue.", projectId);
            }
        } catch (IllegalStateException e) {
            // Catch specific exception for projects with tasks
            logger.warn("Attempt to delete project ID {} failed: {}", projectId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/projects/" + projectId + "/details"; // Redirect to details page to show error
        } catch (IllegalArgumentException e) {
            logger.error("Error deleting project ID {}: {}", projectId, e.getMessage(), e);
            redirectAttributes.addFlashAttribute("errorMessage", "Error deleting project: " + e.getMessage());
        }
        return "redirect:/projects";
    }
}