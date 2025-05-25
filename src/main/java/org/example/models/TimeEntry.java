// src/main/java/org/example/models/TimeEntry.java
package org.example.models;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDate;

@Entity
@Table(name = "time_entries")
public class TimeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Changed from long to Long

    @Column(name = "task_id", nullable = false)
    private Long taskId; // Changed from long to Long

    @Column(name = "user_id", nullable = false)
    private Long userId; // Changed from long to Long

    @Column(name = "date_of_work", nullable = false)
    private LocalDate dateOfWork;

    // Store duration as total minutes (long) in the database
    @Column(name = "duration_spent_minutes", nullable = false)
    private long durationSpentMinutes;

    @Column(columnDefinition = "TEXT")
    private String description;

    // We've removed the static idCounter

    // JPA requires a no-arg constructor
    public TimeEntry() {
    }

    // Constructor for manual time entry
    public TimeEntry(Long taskId, Long userId, LocalDate dateOfWork, Duration durationSpent, String description) {
        if (durationSpent == null || durationSpent.isNegative() || durationSpent.isZero()) {
            throw new IllegalArgumentException("Duration spent must be positive.");
        }
        if (dateOfWork == null) {
            throw new IllegalArgumentException("Date of work cannot be null.");
        }
        // ID is no longer set here

        this.taskId = taskId;
        this.userId = userId;
        this.dateOfWork = dateOfWork;
        this.setDurationSpent(durationSpent); // Use setter to convert to minutes
        this.description = description;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDate getDateOfWork() {
        return dateOfWork;
    }

    // Getter for Duration converts from stored minutes
    public Duration getDurationSpent() {
        return Duration.ofMinutes(this.durationSpentMinutes);
    }

    public String getDescription() {
        return description;
    }

    // Setters
    public void setId(Long id) { // Setter for ID might be used by JPA
        this.id = id;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setDateOfWork(LocalDate dateOfWork) {
        if (dateOfWork == null) {
            throw new IllegalArgumentException("Date of work cannot be null.");
        }
        this.dateOfWork = dateOfWork;
    }

    // Setter for Duration converts to minutes for storage
    public void setDurationSpent(Duration durationSpent) {
        if (durationSpent == null || durationSpent.isNegative() || durationSpent.isZero()) {
            throw new IllegalArgumentException("Duration spent must be positive.");
        }
        this.durationSpentMinutes = durationSpent.toMinutes();
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "TimeEntry{" +
                "id=" + id +
                ", taskId=" + taskId +
                ", userId=" + userId +
                ", dateOfWork=" + dateOfWork +
                ", durationSpentMinutes=" + durationSpentMinutes +
                ", description='" + description + '\'' +
                '}';
    }
}