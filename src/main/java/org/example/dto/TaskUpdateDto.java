package org.example.dto;

import org.example.models.enums.TaskStatus; // Assuming TaskStatus enum is in org.example.models.enums
import org.example.models.enums.TaskPriority;
import org.example.models.enums.ProjectStage;
import java.time.LocalDate;
// import jakarta.validation.constraints.Size; // For validation
// import jakarta.validation.constraints.Pattern; // For specific patterns if needed

public class TaskUpdateDto {

    private Long id; // Crucial for identifying the task to update

    // @Size(min = 3, max = 255, message = "Task name must be between 3 and 255 characters")
    private String name; // If null or not provided in form, service layer decides how to handle (e.g., no change)

    // @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description; // If null or not provided, service layer handles

    private Long projectId; // To potentially change the project. If null, no change.

    private Long assigneeId; // If null, means no change. To unassign, a special value or specific handling in service is needed.

    private TaskStatus status; // If null, means no change to status

    private ProjectStage projectStage; // If null, means no change to project stage

    private TaskPriority priority; // If null, means no change to priority

    private LocalDate dueDate; // If null, means no change to due date

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public void setProjectStage(ProjectStage projectStage) {
        this.projectStage = projectStage;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}