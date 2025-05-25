// src/main/java/org/example/service/UserService.java
package org.example.service;

import org.example.models.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createUser(String username, String email) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty.");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }
        // Basic validation for uniqueness (can be enhanced with custom exceptions)
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' already exists.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' already exists.");
        }

        User newUser = new User(username, email);
        return userRepository.save(newUser);
    }

    public Optional<User> findUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public Optional<User> updateUser(Long userId, Optional<String> newUsername, Optional<String> newEmail) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return Optional.empty(); // Or throw UserNotFoundException
        }

        User userToUpdate = userOptional.get();
        boolean updated = false;

        if (newUsername.isPresent() && !newUsername.get().trim().isEmpty()) {
            String username = newUsername.get();
            // Check if the new username is different and if it already exists for another user
            if (!userToUpdate.getUsername().equals(username) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username '" + username + "' already taken by another user.");
            }
            userToUpdate.setUsername(username);
            updated = true;
        }

        if (newEmail.isPresent() && !newEmail.get().trim().isEmpty()) {
            String email = newEmail.get();
            // Check if the new email is different and if it already exists for another user
            if (!userToUpdate.getEmail().equals(email) && userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email '" + email + "' already taken by another user.");
            }
            userToUpdate.setEmail(email);
            updated = true;
        }

        if (updated) {
            return Optional.of(userRepository.save(userToUpdate));
        }
        return Optional.of(userToUpdate);
    }

    @Transactional
    public boolean deleteUser(Long userId) {
        if (userRepository.existsById(userId)) {
            // Consider implications: what happens to time entries associated with this user?
            // For now, we'll just delete the user.
            // In a real app, you might need to handle or prevent deletion if related data exists.
            userRepository.deleteById(userId);
            return true;
        }
        return false; // Or throw UserNotFoundException
    }

    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }
}