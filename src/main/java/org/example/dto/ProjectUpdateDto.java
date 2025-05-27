package org.example.dto;

// import jakarta.validation.constraints.Size;

public class ProjectUpdateDto {

    // @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name; // If null, no change

    // @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description; // If null, no change

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
}