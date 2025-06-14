package org.example.dto;

// Add any necessary validation annotations (e.g., from jakarta.validation.constraints)

public class UserRegistrationDto {

    private String username;
    private String email;
    private String password;
    private String confirmPassword;
    private String designation;    // Field for designation
    private String specialization; // Field for specialization

    // --- Constructors ---
    public UserRegistrationDto() {
    }

    public UserRegistrationDto(String username, String email, String password, String confirmPassword, String designation, String specialization) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.designation = designation;
        this.specialization = specialization;
    }


    // --- Getters and Setters ---

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    // Getter for designation - THIS IS LIKELY MISSING OR INCORRECT
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

    // You might also want to add equals, hashCode, and toString methods
}