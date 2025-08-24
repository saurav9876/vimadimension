package org.example.dto;

import org.example.models.User;
import org.example.models.Role;

import java.util.Set;
import java.util.stream.Collectors;

public class UserProfileDto {
    private Long id;
    private String username;
    private String name;
    private String email;
    private boolean enabled;
    private Set<String> roles;
    private String organizationName;

    public UserProfileDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.enabled = user.isEnabled();
        this.roles = user.getRoles() != null ? 
            user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()) : null;
        this.organizationName = user.getOrganization() != null ? 
            user.getOrganization().getName() : null;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
}
