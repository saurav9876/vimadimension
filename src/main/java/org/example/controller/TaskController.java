// /Users/sauravkejriwal/workspace/vimadimension/src/main/java/org/example/controller/TaskController.java
package org.example.controller;

import org.example.dto.TaskCreateDto;
import org.example.dto.TaskUpdateDto;
import org.example.models.Project;
import org.example.models.Task;
import org.example.models.enums.TaskStatus;
import org.example.models.User;
import org.example.service.ProjectService;
import org.example.service.TaskService;
import org.example.service.UserService; // Assuming you have a UserService to fetch users for assignment
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult; // For form validation
// import jakarta.validation.Valid; // For DTO validation
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/tasks") // Base path for task-related operations
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService taskService;
    private final ProjectService projectService; // To fetch project details for context
    private final UserService userService;     // To fetch users for task assignment dropdown

    @Autowired
    public TaskController(TaskService taskService, ProjectService projectService, UserService userService) {
        this.taskService = taskService;
        this.projectService = projectService;
        this.userService = userService;
    }

    // --- Task Creation ---

    @GetMapping("/project/{projectId}/new")
    @PreAuthorize("isAuthenticated()") // Example: Only authenticated users can see the new task form
    public String showCreateTaskForm(@PathVariable Long projectId, Model model) {
        Project project = projectService.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + projectId));

        model.addAttribute("taskCreateDto", new TaskCreateDto());
        model.addAttribute("project", project);
        model.addAttribute("assignableUsers", userService.findAllUsers()); // For assignee dropdown
        model.addAttribute("taskStatuses", TaskStatus.values()); // For status dropdown (though usually set by default)
        return "tasks/task-form"; // Path to your Thymeleaf template for creating/editing tasks
    }

    @PostMapping("/project/{projectId}/create")
    @PreAuthorize("isAuthenticated()")
    public String createTask(@PathVariable Long projectId,
                             // @Valid @ModelAttribute("taskCreateDto") TaskCreateDto taskCreateDto, // Uncomment @Valid for validation
                             @ModelAttribute("taskCreateDto") TaskCreateDto taskCreateDto,
                             BindingResult result,
                             RedirectAttributes redirectAttributes,
                             Model model) {

        Project project = projectService.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + projectId));

        if (result.hasErrors()) {
            logger.warn("Validation errors while creating task for project ID {}: {}", projectId, result.getAllErrors());
            model.addAttribute("project", project);
            model.addAttribute("assignableUsers", userService.findAllUsers());
            model.addAttribute("taskStatuses", TaskStatus.values());
            return "tasks/task-form";
        }

        try {
            taskService.createTask(
                    taskCreateDto.getName(),
                    taskCreateDto.getDescription(),
                    projectId, // project ID from path
                    Optional.ofNullable(taskCreateDto.getAssigneeId())
            );
            redirectAttributes.addFlashAttribute("successMessage", "Task created successfully!");
            return "redirect:/projects/" + projectId + "/details"; // Redirect to project details page
        } catch (IllegalArgumentException e) {
            logger.error("Error creating task for project ID {}: {}", projectId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            model.addAttribute("project", project);
            model.addAttribute("assignableUsers", userService.findAllUsers());
            model.addAttribute("taskStatuses", TaskStatus.values());
            return "tasks/task-form";
        }
    }

    // --- View Task Details ---
    @GetMapping("/{taskId}/details")
    public String showTaskDetails(@PathVariable Long taskId, Model model) {
        Optional<Task> taskOptional = taskService.findTaskById(taskId); // Assuming you have a taskService
        if (taskOptional.isEmpty()) {
            // Handle task not found, e.g., redirect to an error page or project list
            // with a RedirectAttribute message
            return "redirect:/projects"; // Or some error view
        }
        model.addAttribute("task", taskOptional.get());
        return "tasks/task-details";
    }

    @PostMapping("/{taskId}/update")
    @PreAuthorize("isAuthenticated()")
    public String updateTask(@PathVariable Long taskId,
                             // @Valid @ModelAttribute("taskUpdateDto") TaskUpdateDto taskUpdateDto, // Uncomment for validation
                             @ModelAttribute("taskUpdateDto") TaskUpdateDto taskUpdateDto,
                             BindingResult result,
                             RedirectAttributes redirectAttributes,
                             Model model) {

        if (result.hasErrors()) {
            logger.warn("Validation errors while updating task ID {}: {}", taskId, result.getAllErrors());
            // Repopulate model for the form if there are errors
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId)); // Should not happen if form was loaded
            model.addAttribute("task", task);
            model.addAttribute("projects", projectService.findAllProjects());
            model.addAttribute("assignableUsers", userService.findAllUsers());
            model.addAttribute("taskStatuses", TaskStatus.values());
            return "tasks/task-edit-form";
        }

        try {
            taskService.updateTask(
                    taskId,
                    Optional.ofNullable(taskUpdateDto.getName()),
                    Optional.ofNullable(taskUpdateDto.getDescription()),
                    Optional.ofNullable(taskUpdateDto.getProjectId()),
                    Optional.ofNullable(taskUpdateDto.getAssigneeId()), // Service handles inner null for unassigning
                    Optional.ofNullable(taskUpdateDto.getStatus())
            );
            redirectAttributes.addFlashAttribute("successMessage", "Task updated successfully!");
            return "redirect:/tasks/" + taskId + "/details";
        } catch (IllegalArgumentException e) {
            logger.error("Error updating task ID {}: {}", taskId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            // Repopulate model for the form if there are errors
            Task task = taskService.findTaskById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));
            model.addAttribute("task", task);
            model.addAttribute("projects", projectService.findAllProjects());
            model.addAttribute("assignableUsers", userService.findAllUsers());
            model.addAttribute("taskStatuses", TaskStatus.values());
            return "tasks/task-edit-form";
        }
    }

    // --- Task Deletion ---
    @PostMapping("/{taskId}/delete")
    @PreAuthorize("isAuthenticated()") // Consider more specific authorization (e.g., task reporter or project admin)
    public String deleteTask(@PathVariable Long taskId, RedirectAttributes redirectAttributes) {
        Task task = taskService.findTaskById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));
        Long projectId = task.getProject().getId(); // Get project ID for redirect

        try {
            taskService.deleteTask(taskId);
            redirectAttributes.addFlashAttribute("successMessage", "Task deleted successfully.");
        } catch (IllegalStateException | IllegalArgumentException e) {
            logger.error("Error deleting task ID {}: {}", taskId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", "Could not delete task: " + e.getMessage());
            return "redirect:/tasks/" + taskId + "/details"; // Redirect back to task details if deletion fails
        }
        return "redirect:/projects/" + projectId + "/details"; // Redirect to project details page
    }

    // --- Listing Tasks (Examples) ---
    @GetMapping("/my-assigned")
    @PreAuthorize("isAuthenticated()")
    public String getMyAssignedTasks(Model model) {
        List<Task> tasks = taskService.getTasksAssignedToCurrentUser();
        model.addAttribute("tasks", tasks);
        model.addAttribute("listTitle", "My Assigned Tasks");
        return "tasks/task-list"; // A generic task list template
    }

    @GetMapping("/project/{projectId}")
    public String getTasksForProject(@PathVariable Long projectId, Model model) {
        Project project = projectService.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + projectId));
        List<Task> tasks = taskService.getTasksByProjectId(projectId);
        model.addAttribute("tasks", tasks);
        model.addAttribute("project", project);
        model.addAttribute("listTitle", "Tasks for Project: " + project.getName());
        return "tasks/task-list";
    }

    // In your TaskController.java

    @GetMapping("/{taskId}/edit")
    @PreAuthorize("isAuthenticated()") // Or more specific authorization
    public String showEditTaskForm(@PathVariable Long taskId, Model model) {
        Optional<Task> taskOptional = taskService.findTaskById(taskId);
        if (taskOptional.isEmpty()) {
            // Handle task not found, e.g., redirect with an error message
            return "redirect:/projects"; // Or some error view
        }
        Task task = taskOptional.get();

        // Convert Task entity to TaskUpdateDto (or use TaskCreateDto if suitable)
        // This DTO should hold the data to be edited in the form
        TaskUpdateDto taskUpdateDto = new TaskUpdateDto(); // Assuming you have this DTO
        taskUpdateDto.setId(task.getId());
        taskUpdateDto.setName(task.getName());
        taskUpdateDto.setDescription(task.getDescription());
        if (task.getAssignee() != null) {
            taskUpdateDto.setAssigneeId(task.getAssignee().getId());
        }
        taskUpdateDto.setStatus(task.getStatus());
        // Populate other fields as needed

        model.addAttribute("taskUpdateDto", taskUpdateDto);
        model.addAttribute("project", task.getProject()); // For context and back links
        model.addAttribute("assignableUsers", userService.findAllUsers()); // Or a relevant subset
        model.addAttribute("taskStatuses", TaskStatus.values());

        logger.debug("Displaying edit form for task ID: {}", taskId);
        return "tasks/task-edit-form"; // This is the template we just created
    }
}