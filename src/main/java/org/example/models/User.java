// src/main/java/org/example/models/User.java
package org.example.models;

import jakarta.persistence.*; // Using Jakarta Persistence for Spring Boot 3+

@Entity
@Table(name = "users") // Specifies the database table name
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB will auto-generate the ID
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    // We'll skip password for now to keep it simple, but you'd add it here for a real app
    // private String password;

    // JPA requires a no-argument constructor
    public User() {
    }

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    // Setters (JPA might need them, or you might use them for updates)
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                '}';
    }

    // It's good practice to implement equals() and hashCode() for entities,
    // especially if you plan to use them in collections or compare them.
    // For brevity, I'll omit them here but consider adding them based on 'id' or 'email'/'username'.
}