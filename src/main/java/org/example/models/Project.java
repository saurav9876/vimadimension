// src/main/java/org/example/models/Project.java
package org.example.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.example.models.enums.ProjectCategory;
import org.example.models.enums.ProjectStatus;
import org.example.models.enums.ProjectStage;
import java.time.LocalDate;
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
    
    // Get organization ID without triggering lazy loading
    public Long getOrganizationId() {
        return organization != null ? organization.getId() : null;
    }
}