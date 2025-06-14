// src/main/java/org/example/models/Project.java
package org.example.models;

import jakarta.persistence.*;
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

    @Column(columnDefinition = "TEXT")
    private String description;

    // ... other existing fields like client, location, startDate, endDate ...

    // Optional: Mapped by the 'accessibleProjects' field in the User entity
    @ManyToMany(mappedBy = "accessibleProjects", fetch = FetchType.LAZY)
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
    // (id, name, description, etc.)
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
}