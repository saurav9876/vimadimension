package org.example.service;

import org.example.models.Project;
import org.example.models.Task;
import org.example.models.enums.TaskStatus;
import org.example.models.enums.ProjectStage;
import org.example.models.User;
import org.example.repository.ProjectRepository;
import org.example.repository.TaskRepository;
import org.example.repository.UserRepository;
// import org.example.repository.TimeLogRepository; // Keep for when you implement TimeLog deletion logic
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    // private final TimeLogRepository timeLogRepository; // For handling related time entries

    @Autowired
    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository
            /*, TimeLogRepository timeLogRepository */) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        // this.timeLogRepository = timeLogRepository;
    }

    /**
     * Helper method to get the currently authenticated user.
     * @return The authenticated User entity.
     * @throws IllegalStateException if the authenticated user cannot be found in the database.
     */
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("No authenticated user found.");
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

    @Transactional
    public Task createTask(String name, String description, ProjectStage projectStage, Long projectId, Optional<Long> assigneeIdOpt) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Task name cannot be empty.");
        }
        if (projectStage == null) {
            throw new IllegalArgumentException("Project stage cannot be empty.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project with ID " + projectId + " not found. Cannot create task."));

        User reporter = getCurrentAuthenticatedUser();
        User assignee = null;
        if (assigneeIdOpt.isPresent()) {
            assignee = userRepository.findById(assigneeIdOpt.get())
                    .orElseThrow(() -> new IllegalArgumentException("Assignee user with ID " + assigneeIdOpt.get() + " not found."));
        }

        Task newTask = new Task();
        newTask.setName(name.trim());
        newTask.setDescription(description != null ? description.trim() : null);
        newTask.setProjectStage(projectStage);
        newTask.setProject(project);
        newTask.setReporter(reporter);
        newTask.setAssignee(assignee);
        newTask.setStatus(TaskStatus.TO_DO); // Default status
        // createdAt and updatedAt are handled by @PrePersist in Task entity

        return taskRepository.save(newTask);
    }

    public Optional<Task> findTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Counts tasks by organization.
     *
     * @param organizationId The ID of the organization.
     * @return The count of tasks belonging to the specified organization.
     */
    public long countTasksByOrganization(Long organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        return taskRepository.countByProject_Organization_Id(organizationId);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID cannot be null.");
        }
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("Project with ID " + projectId + " not found.");
        }
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByAssigneeId(Long assigneeId) {
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new IllegalArgumentException("Assignee user with ID " + assigneeId + " not found."));
        return taskRepository.findByAssignee(assignee);
    }

    public List<Task> getTasksAssignedToCurrentUser() {
        User currentUser = getCurrentAuthenticatedUser();
        return taskRepository.findByAssignee(currentUser);
    }

    public List<Task> getTasksReportedByCurrentUser() {
        User currentUser = getCurrentAuthenticatedUser();
        return taskRepository.findByReporter(currentUser);
    }


    @Transactional
    public Optional<Task> updateTask(Long taskId,
                                     Optional<String> newNameOpt,
                                     Optional<String> newDescriptionOpt,
                                     Optional<Long> newProjectIdOpt,
                                     Optional<Long> newAssigneeIdOpt, // Use Optional<Optional<Long>> or a flag for unassigning if null means "no change"
                                     Optional<TaskStatus> newStatusOpt) {

        Task taskToUpdate = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + taskId + " not found."));

        boolean updated = false;

        if (newNameOpt.isPresent()) {
            String nameValue = newNameOpt.get().trim();
            if (nameValue.isEmpty()) {
                throw new IllegalArgumentException("Task name cannot be updated to empty.");
            }
            taskToUpdate.setName(nameValue);
            updated = true;
        }

        if (newDescriptionOpt.isPresent()) {
            taskToUpdate.setDescription(newDescriptionOpt.get()); // Allow null/empty description
            updated = true;
        }

        if (newProjectIdOpt.isPresent()) {
            Project project = projectRepository.findById(newProjectIdOpt.get())
                    .orElseThrow(() -> new IllegalArgumentException("Project with ID " + newProjectIdOpt.get() + " not found for task update."));
            taskToUpdate.setProject(project);
            updated = true;
        }

        // Handling assignee update:
        // If newAssigneeIdOpt is present, it means an update to assignee is intended.
        // If the inner value (Long) is null, it means unassign.
        // If newAssigneeIdOpt is empty, no change to assignee.
        if (newAssigneeIdOpt.isPresent()) {
            Long assigneeId = newAssigneeIdOpt.get();
            if (assigneeId == null) { // Explicitly unassign
                taskToUpdate.setAssignee(null);
            } else {
                User assignee = userRepository.findById(assigneeId)
                        .orElseThrow(() -> new IllegalArgumentException("Assignee user with ID " + assigneeId + " not found for task update."));
                taskToUpdate.setAssignee(assignee);
            }
            updated = true;
        }


        if (newStatusOpt.isPresent()) {
            taskToUpdate.setStatus(newStatusOpt.get());
            updated = true;
        }

        if (updated) {
            // updatedAt is handled by @PreUpdate in Task entity
            return Optional.of(taskRepository.save(taskToUpdate));
        }
        // Return the task even if no fields were changed, or Optional.empty() if you prefer
        return Optional.of(taskToUpdate);
    }

    @Transactional
    public Task updateTask(Long taskId, String name, String description, String projectStage, String status) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Task name cannot be empty.");
        }
        if (projectStage == null || projectStage.trim().isEmpty()) {
            throw new IllegalArgumentException("Project stage cannot be empty.");
        }
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Task status cannot be empty.");
        }

        Task taskToUpdate = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + taskId + " not found."));

        // Parse enums
        ProjectStage projectStageEnum;
        try {
            projectStageEnum = ProjectStage.valueOf(projectStage);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid project stage: " + projectStage);
        }

        TaskStatus statusEnum;
        try {
            statusEnum = TaskStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid task status: " + status);
        }

        // Update fields
        taskToUpdate.setName(name.trim());
        taskToUpdate.setDescription(description != null ? description.trim() : null);
        taskToUpdate.setProjectStage(projectStageEnum);
        taskToUpdate.setStatus(statusEnum);

        // updatedAt is handled by @PreUpdate in Task entity
        return taskRepository.save(taskToUpdate);
    }

    @Transactional
    public Optional<Task> updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task taskToUpdate = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task with ID " + taskId + " not found."));

        if (newStatus == null) {
            throw new IllegalArgumentException("New status cannot be null.");
        }

        taskToUpdate.setStatus(newStatus);
        // updatedAt is handled by @PreUpdate in Task entity
        return Optional.of(taskRepository.save(taskToUpdate));
    }

    @Transactional
    public boolean deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            // Consider throwing a TaskNotFoundException here for better error handling upstream
            return false;
        }
        // CRITICAL: Implement logic for handling TimeLog entries associated with this task.
        // Option 1: Delete associated TimeLog entries.
        //   List<TimeLog> timeLogs = timeLogRepository.findByTaskId(taskId);
        //   timeLogRepository.deleteAll(timeLogs);
        // Option 2: Prevent deletion if TimeLog entries exist.
        //   if (timeLogRepository.existsByTaskId(taskId)) { // Assuming existsByTaskId method in TimeLogRepository
        //       throw new IllegalStateException("Cannot delete task with ID " + taskId + " as it has associated time entries.");
        //   }
        // Option 3: Set task_id to null in TimeLog entries (if your schema allows and makes sense).
        //   This would require iterating and updating TimeLog entities.

        taskRepository.deleteById(taskId);
        return true;
    }

    public boolean taskExists(Long taskId) {
        return taskRepository.existsById(taskId);
    }
}