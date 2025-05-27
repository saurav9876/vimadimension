// src/main/java/org/example/service/ProjectService.java
package org.example.service;

import org.example.dto.ProjectCreateDto;
import org.example.dto.ProjectUpdateDto;
import org.example.models.Project;
import org.example.repository.ProjectRepository;
import org.example.repository.TaskRepository; // Import TaskRepository
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository; // Added TaskRepository

    @Autowired
    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository; // Initialize TaskRepository
    }

    @Transactional
    public Project createProject(ProjectCreateDto projectCreateDto) {
        if (projectCreateDto == null) {
            logger.warn("Attempted to create a project with null DTO.");
            throw new IllegalArgumentException("Project data cannot be null.");
        }
        String name = projectCreateDto.getName();
        if (name == null || name.trim().isEmpty()) {
            logger.warn("Attempted to create a project with empty name.");
            throw new IllegalArgumentException("Project name cannot be empty.");
        }

        String trimmedName = name.trim();
        if (projectRepository.findByName(trimmedName).isPresent()) {
            logger.warn("Attempted to create a project with duplicate name: {}", trimmedName);
            throw new IllegalArgumentException("Project with name '" + trimmedName + "' already exists.");
        }

        Project newProject = new Project();
        newProject.setName(trimmedName);
        newProject.setDescription(projectCreateDto.getDescription() != null ? projectCreateDto.getDescription().trim() : null);
        // Assuming Project entity handles createdAt/updatedAt via @PrePersist/@PreUpdate

        Project savedProject = projectRepository.save(newProject);
        logger.info("Project created successfully with ID: {} and name: {}", savedProject.getId(), savedProject.getName());
        return savedProject;
    }

    public Optional<Project> findById(Long projectId) { // Renamed for consistency
        return projectRepository.findById(projectId);
    }

    public Optional<Project> findByName(String name) { // Renamed for consistency
        if (name == null || name.trim().isEmpty()) {
            return Optional.empty();
        }
        return projectRepository.findByName(name.trim());
    }

    public List<Project> findByNameContaining(String nameFragment) { // Renamed for consistency
        if (nameFragment == null || nameFragment.trim().isEmpty()) {
            return projectRepository.findAll(); // Or return empty list based on desired behavior
        }
        return projectRepository.findByNameContainingIgnoreCase(nameFragment.trim());
    }

    public List<Project> findAllProjects() { // Renamed for consistency
        return projectRepository.findAll();
    }

    @Transactional
    public Optional<Project> updateProject(Long projectId, ProjectUpdateDto projectUpdateDto) {
        if (projectUpdateDto == null) {
            logger.warn("Attempted to update project ID {} with null DTO.", projectId);
            throw new IllegalArgumentException("Project update data cannot be null.");
        }

        Optional<Project> projectOptional = projectRepository.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempted to update non-existent project with ID: {}", projectId);
            return Optional.empty(); // Or throw ProjectNotFoundException
        }

        Project projectToUpdate = projectOptional.get();
        boolean updated = false;

        if (projectUpdateDto.getName() != null) {
            String newName = projectUpdateDto.getName().trim();
            if (newName.isEmpty()) {
                logger.warn("Attempted to update project ID {} with an empty name.", projectId);
                throw new IllegalArgumentException("Project name cannot be updated to empty.");
            }
            // Check if the new name conflicts with another existing project
            if (!projectToUpdate.getName().equalsIgnoreCase(newName) &&
                    projectRepository.findByName(newName).filter(p -> !p.getId().equals(projectId)).isPresent()) {
                logger.warn("Attempted to update project ID {} to a name '{}' that already exists for another project.", projectId, newName);
                throw new IllegalArgumentException("Another project with name '" + newName + "' already exists.");
            }
            if (!projectToUpdate.getName().equals(newName)) {
                projectToUpdate.setName(newName);
                updated = true;
            }
        }

        if (projectUpdateDto.getDescription() != null) {
            // Allow setting description to empty or null if desired by passing an empty string or explicit null
            String newDescription = projectUpdateDto.getDescription(); // No trim here if you want to allow leading/trailing spaces intentionally, or trim if not.
            if (!Objects.equals(projectToUpdate.getDescription(), newDescription)) { // Check if actually changed
                projectToUpdate.setDescription(newDescription);
                updated = true;
            }
        }


        if (updated) {
            Project savedProject = projectRepository.save(projectToUpdate);
            logger.info("Project ID {} updated. New name: {}", savedProject.getId(), savedProject.getName());
            return Optional.of(savedProject);
        }
        logger.info("Project ID {} was not updated as no changes were provided or necessary.", projectId);
        return Optional.of(projectToUpdate); // Return the original if no actual changes were made
    }

    @Transactional
    public boolean deleteProject(Long projectId) {
        Optional<Project> projectOptional = projectRepository.findById(projectId);
        if (projectOptional.isEmpty()) {
            logger.warn("Attempt to delete non-existent project with ID: {}", projectId);
            return false; // Or throw ProjectNotFoundException
        }

        // Check if there are any tasks associated with this project
        if (taskRepository.existsByProjectId(projectId)) {
            logger.warn("Attempt to delete project ID {} which has associated tasks. Deletion prevented.", projectId);
            throw new IllegalStateException("Cannot delete project with ID " + projectId + " as it has associated tasks. Please delete or reassign tasks first.");
        }

        projectRepository.deleteById(projectId);
        logger.info("Project with ID: {} deleted successfully.", projectId);
        return true;
    }

    // Helper method to check existence, can be useful in controllers
    public boolean existsById(Long projectId) {
        return projectRepository.existsById(projectId);
    }
}