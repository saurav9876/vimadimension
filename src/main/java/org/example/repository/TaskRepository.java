package org.example.repository;

import org.example.models.Project;
import org.example.models.Task;
import org.example.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByReporter(User reporter);
    List<Task> findByProjectId(Long projectId); // Useful for direct lookup
    boolean existsByProjectId(Long projectId); // Add this if not present
    
    // Organization-based queries - using correct JPA property path
    long countByProject_Organization_Id(Long organizationId);
}