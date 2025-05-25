// src/main/java/org/example/repository/TaskRepository.java
package org.example.repository;

import org.example.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all tasks associated with a specific project ID
    List<Task> findByProjectId(Long projectId);

    // Example: Find tasks by name within a specific project
    List<Task> findByProjectIdAndNameContainingIgnoreCase(Long projectId, String nameFragment);

}