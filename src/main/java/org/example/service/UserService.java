package org.example.service;

import org.example.dto.UserRegistrationDto;
import org.example.models.Role; // Import the Role entity
import org.example.models.User;
import org.example.repository.RoleRepository; // Import RoleRepository
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final RoleRepository roleRepository; // Inject RoleRepository

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       RoleRepository roleRepository) { // Add RoleRepository to constructor
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
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
        // ... (your existing validation checks remain the same)
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

        // --- UPDATED SECTION ---
        // Set designation and specialization from the DTO
        // It's good practice to check if they are provided and not empty,
        // though your User entity might allow nulls for these.
        if (registrationDto.getDesignation() != null && !registrationDto.getDesignation().trim().isEmpty()) {
            newUser.setDesignation(registrationDto.getDesignation().trim());
        }
        if (registrationDto.getSpecialization() != null && !registrationDto.getSpecialization().trim().isEmpty()) {
            newUser.setSpecialization(registrationDto.getSpecialization().trim());
        }
        // --- END OF UPDATED SECTION ---

        // Assign a default role, e.g., "ROLE_USER"
        Set<Role> userRoles = new HashSet<>();
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    // If "ROLE_USER" doesn't exist, create and save it.
                    // In a real app, you might want to ensure roles are pre-populated.
                    Role newRole = new Role("ROLE_USER");
                    return roleRepository.save(newRole);
                });
        userRoles.add(userRole);
        newUser.setRoles(userRoles);

        return userRepository.save(newUser);
    }

    /**
     * Finds a user by their username.
     * This method should also initialize LAZY loaded collections if they are
     * consistently needed by the callers immediately after fetching the user.
     *
     * @param username The username to search for.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    @Transactional(readOnly = true) // Good for read operations and managing session for LAZY loading
    public Optional<User> findByUsername(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username.trim().toLowerCase());
        userOptional.ifPresent(user -> {
            // Initialize LAZY collections if needed by the caller immediately
            // This forces Hibernate to load the collection within the transaction
            if (user.getRoles() != null) {
                user.getRoles().size(); // Accessing size() is a common way to initialize
            }
            if (user.getAccessibleProjects() != null) {
                user.getAccessibleProjects().size();
            }
        });
        return userOptional;
    }

    /**
     * Finds a user by their email address.
     *
     * @param email The email address to search for.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase());
    }

    /**
     * Finds a user by their ID.
     *
     * @param id The ID of the user.
     * @return An Optional containing the User if found, or an empty Optional otherwise.
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        userOptional.ifPresent(user -> {
            if (user.getRoles() != null) user.getRoles().size();
            if (user.getAccessibleProjects() != null) user.getAccessibleProjects().size();
        });
        return userOptional;
    }

    /**
     * Retrieves all users.
     *
     * @return A list of all users.
     */
    public List<User> findAllUsers() {
        // Be cautious with findAll() if you have many users and LAZY collections,
        // as it might lead to N+1 problems if you iterate and access LAZY fields.
        // Consider using DTOs or specific queries for listings.
        return userRepository.findAll();
    }

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

    @Transactional(readOnly = true) // Good for read operations and managing LAZY loading
    public Optional<User> findByUsernameForProfile(String username) { // Or whatever you call it
        Optional<User> userOptional = userRepository.findByUsername(username.trim().toLowerCase());
        userOptional.ifPresent(user -> {
            // Explicitly initialize LAZY collections needed by the profile view
            if (user.getRoles() != null) {
                user.getRoles().size(); // Accessing size() is a common way to initialize
            }
            if (user.getAccessibleProjects() != null) {
                user.getAccessibleProjects().size(); // THIS IS KEY for accessibleProjects
            }
            // You can log here too:
            // System.out.println("Fetching profile for " + user.getUsername() + ". Accessible projects count: " + (user.getAccessibleProjects() != null ? user.getAccessibleProjects().size() : 0));
        });
        return userOptional;
    }

    @Transactional
    public User grantAdminRole(Long userIdToMakeAdmin) throws UsernameNotFoundException, RoleNotFoundException {
        User user = userRepository.findById(userIdToMakeAdmin)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userIdToMakeAdmin));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    // Again, ensure ROLE_ADMIN is pre-populated for robustness
                    Role newRole = new Role("ROLE_ADMIN");
                    return roleRepository.save(newRole);
                });

        // Add admin role if not already present
        // The Set should handle duplicates based on Role's equals/hashCode,
        // but an explicit check can be clearer or a safeguard.
        boolean alreadyAdmin = user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
        if (!alreadyAdmin) {
            user.getRoles().add(adminRole);
            return userRepository.save(user);
        }
        return user; // User was already an admin or no change needed
    }

    // Optional: Custom exception for role not found
    public static class RoleNotFoundException extends RuntimeException {
        public RoleNotFoundException(String message) {
            super(message);
        }
    }
}