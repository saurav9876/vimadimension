package org.example.dto;

import org.example.models.enums.ProjectCategory;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.ProjectPriority;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjectUpdateDto {
    private String name;
    private String clientName;
    private LocalDate startDate;
    private LocalDate estimatedEndDate;
    private String location;
    private ProjectCategory projectCategory;
    private ProjectStatus status;
    private ProjectStage projectStage;
    private String description;
    
    // --- NEW CRITICAL FIELDS ---
    private BigDecimal budget;
    private BigDecimal actualCost;
    private ProjectPriority priority;

    // Constructors
    public ProjectUpdateDto() {
    }

    public ProjectUpdateDto(String name, String clientName, LocalDate startDate, LocalDate estimatedEndDate, 
                          String location, ProjectCategory projectCategory, ProjectStatus status, 
                          ProjectStage projectStage, String description, BigDecimal budget, 
                          BigDecimal actualCost, ProjectPriority priority) {
        this.name = name;
        this.clientName = clientName;
        this.startDate = startDate;
        this.estimatedEndDate = estimatedEndDate;
        this.location = location;
        this.projectCategory = projectCategory;
        this.status = status;
        this.projectStage = projectStage;
        this.description = description;
        this.budget = budget;
        this.actualCost = actualCost;
        this.priority = priority;
    }

    // --- NEW GETTERS AND SETTERS FOR CRITICAL FIELDS ---
    
    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getActualCost() {
        return actualCost;
    }

    public void setActualCost(BigDecimal actualCost) {
        this.actualCost = actualCost;
    }

    public ProjectPriority getPriority() {
        return priority;
    }

    public void setPriority(ProjectPriority priority) {
        this.priority = priority;
    }

    // --- EXISTING GETTERS AND SETTERS ---
    
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}