// src/main/java/org/example/repository/ProjectRepository.java
package org.example.repository;

import org.example.models.Project;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectCategory;
import org.example.models.enums.ProjectPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // Pagination and filtering methods
    Page<Project> findByOrganization_Id(Long organizationId, Pageable pageable);
    
    @Query("SELECT p FROM Project p WHERE p.organization.id = :organizationId " +
           "AND (:category IS NULL OR p.projectCategory = :category) " +
           "AND (:priority IS NULL OR p.priority = :priority) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Project> findByOrganizationAndFilters(@Param("organizationId") Long organizationId,
                                               @Param("category") ProjectCategory category,
                                               @Param("priority") ProjectPriority priority,
                                               @Param("status") ProjectStatus status,
                                               Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.organization.id = :organizationId " +
           "AND (:category IS NULL OR p.projectCategory = :category) " +
           "AND (:priority IS NULL OR p.priority = :priority) " +
           "AND (:status IS NULL OR p.status = :status)")
    long countByOrganizationAndFilters(@Param("organizationId") Long organizationId,
                                       @Param("category") ProjectCategory category,
                                       @Param("priority") ProjectPriority priority,
                                       @Param("status") ProjectStatus status);
}