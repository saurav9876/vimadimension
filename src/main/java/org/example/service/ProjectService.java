// src/main/java/org/example/service/ProjectService.java
package org.example.service;

import org.example.models.Project;
import org.example.repository.ProjectRepository;
// Import TaskRepository if you need to handle tasks when deleting a project
// import org.example.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    // private final TaskRepository taskRepository; // Inject if needed for cascading deletes or checks

    @Autowired
    public ProjectService(ProjectRepository projectRepository /*, TaskRepository taskRepository */) {
        this.projectRepository = projectRepository;
        // this.taskRepository = taskRepository;
    }

    @Transactional
    public Project createProject(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Project name cannot be empty.");
        }
        // Optional: Check if a project with the same name already exists
        if (projectRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Project with name '" + name + "' already exists.");
        }

        Project newProject = new Project(name, description);
        return projectRepository.save(newProject);
    }

    public Optional<Project> findProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    public Optional<Project> findProjectByName(String name) {
        return projectRepository.findByName(name);
    }

    public List<Project> findProjectsByNameContaining(String nameFragment) {
        return projectRepository.findByNameContainingIgnoreCase(nameFragment);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Transactional
    public Optional<Project> updateProject(Long projectId, Optional<String> newName, Optional<String> newDescription) {
        Optional<Project> projectOptional = projectRepository.findById(projectId);
        if (projectOptional.isEmpty()) {
            return Optional.empty(); // Or throw ProjectNotFoundException
        }

        Project projectToUpdate = projectOptional.get();
        boolean updated = false;

        if (newName.isPresent() && !newName.get().trim().isEmpty()) {
            String name = newName.get();
            // Check if new name is different and if it already exists for another project
            if (!projectToUpdate.getName().equals(name) && projectRepository.findByName(name).isPresent()) {
                throw new IllegalArgumentException("Another project with name '" + name + "' already exists.");
            }
            projectToUpdate.setName(name);
            updated = true;
        }

        if (newDescription.isPresent()) { // Allow empty description to clear it
            projectToUpdate.setDescription(newDescription.get());
            updated = true;
        }

        if (updated) {
            return Optional.of(projectRepository.save(projectToUpdate));
        }
        return Optional.of(projectToUpdate);
    }

    @Transactional
    public boolean deleteProject(Long projectId) {
        if (projectRepository.existsById(projectId)) {
            // CRITICAL: Consider what happens to tasks associated with this project.
            // Option 1: Delete them (cascade delete - can be configured in JPA or done manually here).
            // Option 2: Prevent deletion if tasks exist.
            // Option 3: Set tasks' projectId to null (if allowed by your model).
            // For now, we'll just delete the project.
            // Example for checking tasks (requires TaskRepository injection):
            // if (taskRepository.findByProjectId(projectId).isEmpty()) {
            //     projectRepository.deleteById(projectId);
            //     return true;
            // } else {
            //     throw new IllegalStateException("Cannot delete project with ID " + projectId + " as it has associated tasks.");
            // }
            projectRepository.deleteById(projectId);
            return true;
        }
        return false; // Or throw ProjectNotFoundException
    }
}