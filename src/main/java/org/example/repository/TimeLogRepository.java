package org.example.repository;

import org.example.models.Task;
import org.example.models.TimeLog;
import org.example.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByTask(Task task);
    List<TimeLog> findByUser(User user);
    List<TimeLog> findByTask_Id(Long taskId);
    List<TimeLog> findByUser_Id(Long userId);
    List<TimeLog> findByTaskAndDateLogged(Task task, LocalDate dateLogged);
    List<TimeLog> findByUserAndDateLoggedBetween(User user, LocalDate startDate, LocalDate endDate);
}