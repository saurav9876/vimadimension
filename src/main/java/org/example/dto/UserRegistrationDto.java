package org.example.dto;

// You might add validation annotations later (e.g., from jakarta.validation.constraints)
// import jakarta.validation.constraints.Email;
// import jakarta.validation.constraints.NotEmpty;
// import jakarta.validation.constraints.Size;

public class UserRegistrationDto {

    // @NotEmpty
    private String username;

    // @NotEmpty
    // @Email
    private String email; // Assuming you want to collect email

    // @NotEmpty
    // @Size(min = 6, message = "Password should have at least 6 characters")
    private String password;

    private String confirmPassword;

    // Getters and Setters
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
}