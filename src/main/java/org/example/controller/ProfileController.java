package org.example.controller;

import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public ProfileController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Current password is required"
                ));
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "New password is required"
                ));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "New password must be at least 6 characters long"
                ));
            }

            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            var user = userOptional.get();
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Current password is incorrect"
                ));
            }

            // Change the password
            userService.changeUserPassword(user.getId(), newPassword);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password changed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to change password: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/update-profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Name is required"
                ));
            }
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email is required"
                ));
            }

            // Get the current user
            String username = authentication.getName();
            var userOptional = userService.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "User not found"
                ));
            }

            var user = userOptional.get();
            
            // Update the profile
            userService.updateUserProfile(user.getId(), name, email);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to update profile: " + e.getMessage()
            ));
        }
    }
}

