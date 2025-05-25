// src/main/java/org/example/repository/TimeEntryRepository.java
package org.example.repository;

import org.example.models.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> { // TimeEntry is the entity, Long is the type of its ID

    // Spring Data JPA will automatically generate queries based on method names:
    List<TimeEntry> findByUserId(long userId);
    List<TimeEntry> findByTaskId(long taskId);
    List<TimeEntry> findByUserIdAndDateOfWork(long userId, LocalDate dateOfWork);
    List<TimeEntry> findByUserIdAndDateOfWorkBetween(long userId, LocalDate startDate, LocalDate endDate);

    // For more complex queries, you can use @Query annotation
    // Example:
    // @Query("SELECT te FROM TimeEntry te WHERE te.userId = :userId AND te.project.id = :projectId")
    // List<TimeEntry> findByUserAndProject(long userId, long projectId);
}