package org.example.dto;

import org.example.models.enums.ProjectCategory;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStage;
import java.time.LocalDate;

public class ProjectUpdateDto {

    private String name; // If null, no change
    private String clientName; // If null, no change
    private LocalDate startDate; // If null, no change
    private LocalDate estimatedEndDate; // If null, no change
    private String location; // If null, no change
    private ProjectCategory projectCategory; // If null, no change
    private ProjectStatus status; // If null, no change
    private ProjectStage projectStage; // If null, no change
    private String description; // If null, no change

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEstimatedEndDate() {
        return estimatedEndDate;
    }

    public void setEstimatedEndDate(LocalDate estimatedEndDate) {
        this.estimatedEndDate = estimatedEndDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ProjectCategory getProjectCategory() {
        return projectCategory;
    }

    public void setProjectCategory(ProjectCategory projectCategory) {
        this.projectCategory = projectCategory;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public ProjectStage getProjectStage() {
        return projectStage;
    }

    public void setProjectStage(ProjectStage projectStage) {
        this.projectStage = projectStage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}