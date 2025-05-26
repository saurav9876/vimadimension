package org.example.service;

import org.example.dto.UserRegistrationDto;
import org.example.models.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user account.
     *
     * @param registrationDto DTO containing user registration data.
     * @return The newly created and persisted User object.
     * @throws UserRegistrationException if registration fails (e.g., passwords don't match, username/email exists).
     */
    @Transactional
    public User registerNewUser(UserRegistrationDto registrationDto) throws UserRegistrationException {
        String username = registrationDto.getUsername().trim().toLowerCase(); // Normalize
        String email = registrationDto.getEmail().trim().toLowerCase();       // Normalize

        if (registrationDto == null) {
            throw new UserRegistrationException("Registration data cannot be null.");
        }
        if (registrationDto.getUsername() == null || registrationDto.getUsername().trim().isEmpty()) {
            throw new UserRegistrationException("Username cannot be empty.");
        }
        if (registrationDto.getEmail() == null || registrationDto.getEmail().trim().isEmpty()) {
            throw new UserRegistrationException("Email cannot be empty.");
        }
        if (registrationDto.getPassword() == null || registrationDto.getPassword().isEmpty()) {
            throw new UserRegistrationException("Password cannot be empty.");
        }
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            throw new UserRegistrationException("Passwords do not match.");
        }
        if (userRepository.existsByUsername(username)) { // Check with normalized username
            throw new UserRegistrationException("Username already exists: " + registrationDto.getUsername()); // Keep original case for user message
        }
        if (userRepository.existsByEmail(email)) { // Check with normalized email
            throw new UserRegistrationException("Email already exists: " + registrationDto.getEmail()); // Keep original case for user message
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        newUser.setEnabled(true); // Enable user by default

        // Assign a default role, e.g., "ROLE_USER"
        // Spring Security expects roles to start with "ROLE_" prefix for hasRole() checks
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_USER");
        newUser.setRoles(roles);

        return userRepository.save(newUser);
    }

    /**
     * Finds a user by their username.
     *
     * @param username The username to search for.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Finds a user by their email address.
     *
     * @param email The email address to search for.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Finds a user by their ID.
     *
     * @param id The ID of the user.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Retrieves all users.
     *
     * @return A list of all users.
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // You can add more methods here as needed, for example:
    // - updateUser(User user)
    // - deleteUser(Long id)
    // - changePassword(String username, String oldPassword, String newPassword)

    /**
     * Custom exception for user registration specific errors.
     */
    public static class UserRegistrationException extends RuntimeException {
        public UserRegistrationException(String message) {
            super(message);
        }

        public UserRegistrationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}