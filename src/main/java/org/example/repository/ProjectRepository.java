// src/main/java/org/example/repository/ProjectRepository.java
package org.example.repository;

import org.example.models.Project;
import org.example.models.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Example derived query:
    Optional<Project> findByName(String name);
    List<Project> findByNameContainingIgnoreCase(String nameFragment);
    
    // Organization-based queries - using correct JPA property path
    long countByOrganization_Id(Long organizationId);
    long countByOrganization_IdAndStatusNot(Long organizationId, ProjectStatus status);
}