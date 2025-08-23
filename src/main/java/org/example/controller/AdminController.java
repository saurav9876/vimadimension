package org.example.controller;

import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.example.dto.UserRegistrationDto;
import org.example.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/admin") // Base path for admin API operations
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // This endpoint allows an existing admin to grant ROLE_ADMIN to another user.
    // You'd typically call this from an admin UI (e.g., a button next to a user in a list).
    @PostMapping("/users/{userId}/grant-admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // Crucial: Only admins can call this
    public String grantAdminRoleToUser(@PathVariable Long userId, RedirectAttributes redirectAttributes) {
        try {
            userService.grantAdminRole(userId);
            redirectAttributes.addFlashAttribute("successMessage", "User (ID: " + userId + ") has been granted Admin role.");
        } catch (UserService.RoleNotFoundException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error: ROLE_ADMIN definition not found. " + e.getMessage());
        } catch (Exception e) { // Catching UsernameNotFoundException or other general exceptions
            redirectAttributes.addFlashAttribute("errorMessage", "Error granting admin role to user (ID: " + userId + "): " + e.getMessage());
        }
        // Redirect to a user management page, the user's profile, or an admin dashboard
        return "redirect:/admin/user-management"; // Example redirect path
    }

    @PostMapping("/users/create")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody UserRegistrationDto userDto, Authentication authentication) {
        try {
            // Get the current admin user
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
            
            User createdUser = userService.createUser(userDto, adminUser);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User created successfully",
                "user", Map.of(
                    "id", createdUser.getId(),
                    "username", createdUser.getUsername(),
                    "name", createdUser.getName(),
                    "email", createdUser.getEmail()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to create user"
            ));
        }
    }

    // Add endpoint for listing users (this was missing and causing the infinite loop)
    @GetMapping("/users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> listUsers() {
        try {
            List<User> users = userService.findAllUsers();
            List<Map<String, Object>> userList = users.stream()
                .map(user -> Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "name", user.getName() != null ? user.getName() : user.getUsername(),
                    "email", user.getEmail(),
                    "enabled", user.isEnabled(),
                    "roles", user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", userList,
                "message", "Users retrieved successfully"
            ));
        } catch (Exception e) {
            logger.error("Error listing users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to list users"
            ));
        }
    }

    // Endpoint to change user password
    @PostMapping("/users/{userId}/change-password")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> changeUserPassword(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "New password is required"
                ));
            }
            
            userService.changeUserPassword(userId, newPassword);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password changed successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error changing password for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to change password"
            ));
        }
    }

    // Dashboard endpoint as requested
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getDashboard() {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Admin dashboard data",
                "stats", Map.of(
                    "totalUsers", 0,
                    "totalProjects", 0,
                    "totalTasks", 0
                )
            ));
        } catch (Exception e) {
            logger.error("Error getting dashboard: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Failed to get dashboard data"
            ));
        }
    }

    // You would likely have a GET mapping to display a user management page
    // @GetMapping("/user-management")
    // @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    // public String showUserManagementPage(Model model) {
    //     model.addAttribute("users", userService.findAllUsers()); // Example
    //     return "admin/user-management-page"; // Thymeleaf template
    // }
}