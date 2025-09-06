// src/main/java/org/example/models/Project.java
package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.example.models.enums.ProjectCategory;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStage;
import org.example.models.enums.ProjectPriority;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "estimated_end_date")
    private LocalDate estimatedEndDate;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_category", nullable = false)
    private ProjectCategory projectCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_status", nullable = false)
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_stage", nullable = false)
    private ProjectStage projectStage;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- NEW CRITICAL FIELDS ---
    
    @Column(precision = 15, scale = 2)
    private BigDecimal budget; // Project budget in currency units
    
    @Column(name = "actual_cost", precision = 15, scale = 2)
    private BigDecimal actualCost; // Actual cost incurred so far
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectPriority priority = ProjectPriority.MEDIUM; // Default priority
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Organization relationship - projects must belong to an organization
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore // Prevent Hibernate proxy serialization issues
    private Organization organization;

    // Optional: Mapped by the 'accessibleProjects' field in the User entity
    @ManyToMany(mappedBy = "accessibleProjects", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent circular reference during JSON serialization
    private Set<User> accessibleByUsers = new HashSet<>();

    // Constructors, Getters, and Setters

    public Project() {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- LIFECYCLE METHODS ---
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Get organization ID without triggering lazy loading ---
    public Long getOrganizationId() {
        return organization != null ? organization.getId() : null;
    }

    // --- Getter and Setter for accessibleByUsers ---
    public Set<User> getAccessibleByUsers() {
        return accessibleByUsers;
    }

    public void setAccessibleByUsers(Set<User> accessibleByUsers) {
        this.accessibleByUsers = accessibleByUsers;
    }

    // --- Other existing getters and setters ---
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

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}