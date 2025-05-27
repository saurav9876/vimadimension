package org.example.dto;

// Consider adding validation annotations later (e.g., from jakarta.validation.constraints)
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Size;

public class TaskCreateDto {

    // @NotBlank(message = "Task name cannot be blank")
    // @Size(min = 3, max = 255, message = "Task name must be between 3 and 255 characters")
    private String name;

    // @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;

    // @NotNull(message = "Project ID cannot be null")
    private Long projectId;

    private Long assigneeId; // Optional: ID of the user to assign the task to

    // Getters and Setters
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
}