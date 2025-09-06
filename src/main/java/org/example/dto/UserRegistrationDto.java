package org.example.dto;

// Add any necessary validation annotations (e.g., from jakarta.validation.constraints)

public class UserRegistrationDto {

    private String username;
    private String name;        // Field for full name
    private String email;
    private String password;
    private String confirmPassword;
    private String role;          // Field for role
    private String designation;   // Field for designation
    private String specialization; // Field for specialization
    private String bio;           // Field for bio

    // --- Constructors ---
    public UserRegistrationDto() {
    }

    public UserRegistrationDto(String username, String email, String password, String confirmPassword) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }


    // --- Getters and Setters ---

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    // Getter for role
    public String getRole() {
        return role;
    }

    // Setter for role
    public void setRole(String role) {
        this.role = role;
    }

    // Getter for designation
    public String getDesignation() {
        return designation;
    }

    // Setter for designation
    public void setDesignation(String designation) {
        this.designation = designation;
    }

    // Getter for specialization
    public String getSpecialization() {
        return specialization;
    }

    // Setter for specialization
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    // Getter for bio
    public String getBio() {
        return bio;
    }

    // Setter for bio
    public void setBio(String bio) {
        this.bio = bio;
    }

    // You might also want to add equals, hashCode, and toString methods
}