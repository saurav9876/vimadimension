// src/main/java/org/example/service/TaskService.java
package org.example.service;

import org.example.models.Task;
import org.example.repository.TaskRepository;
import org.example.repository.ProjectRepository; // To validate project existence
// Import TimeEntryRepository if you need to handle time entries when deleting a task
// import org.example.repository.TimeEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository; // For validating project existence
    // private final TimeEntryRepository timeEntryRepository; // For handling related time entries

    @Autowired
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository
            /*, TimeEntryRepository timeEntryRepository */) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        // this.timeEntryRepository = timeEntryRepository;
    }

    @Transactional
    public Task createTask(String name, String description, Long projectId) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Task name cannot be empty.");
        }
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID cannot be null for a task.");
        }
        // Validate that the project exists
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("Project with ID " + projectId + " not found. Cannot create task.");
        }

        Task newTask = new Task(name, description, projectId);
        return taskRepository.save(newTask);
    }

    public Optional<Task> findTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        if (projectId == null) {
            return Collections.emptyList(); // Or throw an exception
        }
        // Optionally, check if project exists before querying
        if (!projectRepository.existsById(projectId)) {
            // Or throw an exception: throw new IllegalArgumentException("Project with ID " + projectId + " not found.");
            return Collections.emptyList();
        }
        return taskRepository.findByProjectId(projectId);
    }

    @Transactional
    public Optional<Task> updateTask(Long taskId, Optional<String> newName, Optional<String> newDescription, Optional<Long> newProjectId) {
        Optional<Task> taskOptional = taskRepository.findById(taskId);
        if (taskOptional.isEmpty()) {
            return Optional.empty(); // Or throw TaskNotFoundException
        }

        Task taskToUpdate = taskOptional.get();
        boolean updated = false;

        if (newName.isPresent() && !newName.get().trim().isEmpty()) {
            taskToUpdate.setName(newName.get());
            updated = true;
        }
        if (newDescription.isPresent()) {
            taskToUpdate.setDescription(newDescription.get());
            updated = true;
        }
        if (newProjectId.isPresent()) {
            Long pid = newProjectId.get();
            if (!projectRepository.existsById(pid)) {
                throw new IllegalArgumentException("Cannot update task: Project with ID " + pid + " not found.");
            }
            taskToUpdate.setProjectId(pid);
            updated = true;
        }

        if (updated) {
            return Optional.of(taskRepository.save(taskToUpdate));
        }
        return Optional.of(taskToUpdate);
    }

    @Transactional
    public boolean deleteTask(Long taskId) {
        if (taskRepository.existsById(taskId)) {
            // CRITICAL: Consider what happens to time entries associated with this task.
            // Similar to project deletion, you'd need to decide on a strategy.
            // Example:
            // if (timeEntryRepository.findByTaskId(taskId).isEmpty()) {
            //     taskRepository.deleteById(taskId);
            //     return true;
            // } else {
            //     throw new IllegalStateException("Cannot delete task with ID " + taskId + " as it has associated time entries.");
            // }
            taskRepository.deleteById(taskId);
            return true;
        }
        return false; // Or throw TaskNotFoundException
    }

    public boolean taskExists(Long taskId) {
        return taskRepository.existsById(taskId);
    }
}