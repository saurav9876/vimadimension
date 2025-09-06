// src/main/java/org/example/service/ProjectService.java
package org.example.service;

import org.example.dto.ProjectCreateDto;
import org.example.dto.ProjectUpdateDto;
import org.example.models.Project;
import org.example.models.User;
import org.example.repository.ProjectRepository;
import org.example.repository.TaskRepository; // Import TaskRepository
import org.example.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.example.models.enums.ProjectStatus;

@Service
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository; // Inject UserRepository
    private final TaskRepository taskRepository; // Added TaskRepository

    @Autowired
    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
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
    
    public List<Project> findProjectsByOrganization(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        if (user.getOrganization() == null) {
            logger.warn("User {} does not belong to any organization. Returning empty project list.", username);
            return List.of(); // Return empty list
        }
        
        // This would require adding a method to ProjectRepository
        // For now, let's filter from all projects (not optimal for large datasets)
        return projectRepository.findAll().stream()
                .filter(project -> Objects.equals(project.getOrganization(), user.getOrganization()))
                .collect(Collectors.toList());
    }

    /**
     * Counts projects by organization.
     *
     * @param organizationId The ID of the organization.
     * @return The count of projects belonging to the specified organization.
     */
    public long countProjectsByOrganization(Long organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        return projectRepository.countByOrganization_Id(organizationId);
    }

    /**
     * Counts active projects by organization.
     *
     * @param organizationId The ID of the organization.
     * @return The count of active projects belonging to the specified organization.
     */
    public long countActiveProjectsByOrganization(Long organizationId) {
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID cannot be null");
        }
        return projectRepository.countByOrganization_IdAndStatusNot(organizationId, ProjectStatus.COMPLETED);
    }

    @Transactional // This ensures all database operations are part of a single transaction
    public Project createProject(ProjectCreateDto projectCreateDto, String creatorUsername) {
        // First, get the user to access their organization
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found: " + creatorUsername + ". Cannot assign project creator."));

        // Check if user has an organization
        if (creator.getOrganization() == null) {
            logger.error("User {} does not belong to any organization. Cannot create project.", creatorUsername);
            throw new IllegalStateException("User must belong to an organization to create projects.");
        }

        // Validate required fields
        if (projectCreateDto.getName() == null || projectCreateDto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name cannot be empty.");
        }
        if (projectCreateDto.getClientName() == null || projectCreateDto.getClientName().trim().isEmpty()) {
            throw new IllegalArgumentException("Client name cannot be empty.");
        }
        if (projectCreateDto.getStartDate() == null) {
            throw new IllegalArgumentException("Start date cannot be empty.");
        }
        if (projectCreateDto.getLocation() == null || projectCreateDto.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location cannot be empty.");
        }
        if (projectCreateDto.getProjectCategory() == null) {
            throw new IllegalArgumentException("Project category cannot be empty.");
        }
        if (projectCreateDto.getStatus() == null) {
            throw new IllegalArgumentException("Project status cannot be empty.");
        }
        if (projectCreateDto.getProjectStage() == null) {
            throw new IllegalArgumentException("Project stage cannot be empty.");
        }

        Project project = new Project();
        project.setName(projectCreateDto.getName().trim());
        project.setClientName(projectCreateDto.getClientName().trim());
        project.setStartDate(projectCreateDto.getStartDate());
        project.setEstimatedEndDate(projectCreateDto.getEstimatedEndDate());
        project.setLocation(projectCreateDto.getLocation().trim());
        project.setProjectCategory(projectCreateDto.getProjectCategory());
        project.setStatus(projectCreateDto.getStatus());
        project.setProjectStage(projectCreateDto.getProjectStage());
        project.setDescription(projectCreateDto.getDescription() != null ? projectCreateDto.getDescription().trim() : null);
        
        // --- SET NEW CRITICAL FIELDS ---
        project.setBudget(projectCreateDto.getBudget());
        project.setActualCost(projectCreateDto.getActualCost());
        project.setPriority(projectCreateDto.getPriority() != null ? projectCreateDto.getPriority() : org.example.models.enums.ProjectPriority.MEDIUM);
        
        project.setOrganization(creator.getOrganization()); // Set the organization from the user
        
        logger.info("Creating project '{}' for organization: {}", project.getName(), creator.getOrganization().getName());

        Project savedProject = projectRepository.save(project); // Project is saved with organization

        // Initialize the set if it's null (important for new users or if not eagerly fetched before)
        if (creator.getAccessibleProjects() == null) {
            creator.setAccessibleProjects(new HashSet<>());
        }
        creator.getAccessibleProjects().add(savedProject); // Add to the collection

        userRepository.save(creator); // CRUCIAL: Save the User entity to persist the relationship

        logger.info("Project '{}' created successfully for organization '{}' by user '{}'", 
                   savedProject.getName(), creator.getOrganization().getName(), creatorUsername);

        return savedProject;
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

        if (projectUpdateDto.getClientName() != null) {
            String newClientName = projectUpdateDto.getClientName().trim();
            if (newClientName.isEmpty()) {
                logger.warn("Attempted to update project ID {} with an empty client name.", projectId);
                throw new IllegalArgumentException("Client name cannot be updated to empty.");
            }
            if (!Objects.equals(projectToUpdate.getClientName(), newClientName)) {
                projectToUpdate.setClientName(newClientName);
                updated = true;
            }
        }

        if (projectUpdateDto.getStartDate() != null) {
            if (!Objects.equals(projectToUpdate.getStartDate(), projectUpdateDto.getStartDate())) {
                projectToUpdate.setStartDate(projectUpdateDto.getStartDate());
                updated = true;
            }
        }

        if (projectUpdateDto.getEstimatedEndDate() != null) {
            if (!Objects.equals(projectToUpdate.getEstimatedEndDate(), projectUpdateDto.getEstimatedEndDate())) {
                projectToUpdate.setEstimatedEndDate(projectUpdateDto.getEstimatedEndDate());
                updated = true;
            }
        }

        if (projectUpdateDto.getLocation() != null) {
            String newLocation = projectUpdateDto.getLocation().trim();
            if (newLocation.isEmpty()) {
                logger.warn("Attempted to update project ID {} with an empty location.", projectId);
                throw new IllegalArgumentException("Location cannot be updated to empty.");
            }
            if (!Objects.equals(projectToUpdate.getLocation(), newLocation)) {
                projectToUpdate.setLocation(newLocation);
                updated = true;
            }
        }

        if (projectUpdateDto.getProjectCategory() != null) {
            if (!Objects.equals(projectToUpdate.getProjectCategory(), projectUpdateDto.getProjectCategory())) {
                projectToUpdate.setProjectCategory(projectUpdateDto.getProjectCategory());
                updated = true;
            }
        }

        if (projectUpdateDto.getStatus() != null) {
            if (!Objects.equals(projectToUpdate.getStatus(), projectUpdateDto.getStatus())) {
                projectToUpdate.setStatus(projectUpdateDto.getStatus());
                updated = true;
            }
        }

        if (projectUpdateDto.getProjectStage() != null) {
            if (!Objects.equals(projectToUpdate.getProjectStage(), projectUpdateDto.getProjectStage())) {
                projectToUpdate.setProjectStage(projectUpdateDto.getProjectStage());
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

        // --- UPDATE NEW CRITICAL FIELDS ---
        if (projectUpdateDto.getBudget() != null) {
            if (!Objects.equals(projectToUpdate.getBudget(), projectUpdateDto.getBudget())) {
                projectToUpdate.setBudget(projectUpdateDto.getBudget());
                updated = true;
            }
        }

        if (projectUpdateDto.getActualCost() != null) {
            if (!Objects.equals(projectToUpdate.getActualCost(), projectUpdateDto.getActualCost())) {
                projectToUpdate.setActualCost(projectUpdateDto.getActualCost());
                updated = true;
            }
        }

        if (projectUpdateDto.getPriority() != null) {
            if (!Objects.equals(projectToUpdate.getPriority(), projectUpdateDto.getPriority())) {
                projectToUpdate.setPriority(projectUpdateDto.getPriority());
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

        Project project = projectOptional.get();

        // Check if there are any tasks associated with this project
        if (taskRepository.existsByProjectId(projectId)) {
            logger.warn("Attempt to delete project ID {} which has associated tasks. Deletion prevented.", projectId);
            throw new IllegalStateException("Cannot delete project with ID " + projectId + " as it has associated tasks. Please delete or reassign tasks first.");
        }

        // Remove the project from all users' accessible projects to avoid foreign key constraint violation
        // Get all users who have access to this project and remove the association
        for (User user : project.getAccessibleByUsers()) {
            user.getAccessibleProjects().remove(project);
        }
        
        // Clear the associations from the project side as well
        project.getAccessibleByUsers().clear();
        
        // Save the project to persist the cleared associations before deletion
        projectRepository.save(project);

        projectRepository.deleteById(projectId);
        logger.info("Project with ID: {} deleted successfully.", projectId);
        return true;
    }

    // Helper method to check existence, can be useful in controllers
    public boolean existsById(Long projectId) {
        return projectRepository.existsById(projectId);
    }
}