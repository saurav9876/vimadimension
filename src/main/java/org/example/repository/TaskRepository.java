package org.example.repository;

import org.example.models.Project;
import org.example.models.Task;
import org.example.models.User;
import org.example.models.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByAssigneeAndStatusNotIn(User assignee, List<TaskStatus> statuses);
    Page<Task> findByAssigneeAndStatusNotIn(User assignee, List<TaskStatus> statuses, Pageable pageable);
    List<Task> findByReporter(User reporter);
    List<Task> findByReporterAndStatusNotIn(User reporter, List<TaskStatus> statuses);
    Page<Task> findByReporterAndStatusNotIn(User reporter, List<TaskStatus> statuses, Pageable pageable);
    List<Task> findByCheckedBy(User checkedBy);
    List<Task> findByCheckedByAndStatus(User checkedBy, TaskStatus status);
    Page<Task> findByCheckedByAndStatus(User checkedBy, TaskStatus status, Pageable pageable);
    List<Task> findByProjectId(Long projectId); // Useful for direct lookup
    Page<Task> findByProjectId(Long projectId, Pageable pageable);
    boolean existsByProjectId(Long projectId); // Add this if not present
    
    // Organization-based queries - using correct JPA property path
    long countByProject_Organization_Id(Long organizationId);
}
