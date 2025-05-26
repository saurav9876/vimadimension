// src/main/java/org/example/service/ProjectService.java
package org.example.service;

import org.example.models.Project;
import org.example.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public Project createProject(Project project) { // Changed parameter to Project object
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null.");
        }
        String name = project.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Project name cannot be empty.");
        }
        // Optional: Check if a project with the same name already exists
        if (projectRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Project with name '" + name + "' already exists.");
        }

        // The project object passed in is already populated with name and description
        // from the form. We just need to save it.
        // If the Project entity has auto-generated ID, ensure it's null or 0 before saving
        // if you want to guarantee a new entity creation, though save() handles this.
        // If the Project constructor in the entity sets default values or if there are
        // other fields to initialize, you might do it here or ensure the entity is complete.
        return projectRepository.save(project);
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
            return Optional.empty();
        }

        Project projectToUpdate = projectOptional.get();
        boolean updated = false;

        if (newName.isPresent() && !newName.get().trim().isEmpty()) {
            String name = newName.get();
            if (!projectToUpdate.getName().equals(name) && projectRepository.findByName(name).isPresent()) {
                throw new IllegalArgumentException("Another project with name '" + name + "' already exists.");
            }
            projectToUpdate.setName(name);
            updated = true;
        }

        if (newDescription.isPresent()) {
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
            projectRepository.deleteById(projectId);
            return true;
        }
        return false;
    }
}