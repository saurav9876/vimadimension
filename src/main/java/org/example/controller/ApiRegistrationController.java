package org.example.controller;

import org.example.dto.UserRegistrationDto;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.example.models.User;

@RestController
@RequestMapping("/api/registration")
public class ApiRegistrationController {

    private final UserService userService;

    @Autowired
    public ApiRegistrationController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/register")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> showRegistrationForm() {
        Map<String, Object> response = new HashMap<>();
        response.put("userRegistrationDto", new UserRegistrationDto());
        response.put("message", "Admin registration form");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> registerUser(@ModelAttribute UserRegistrationDto registrationDto,
                                        BindingResult result, Authentication authentication) {
        // Add explicit password confirmation check
        if (registrationDto.getPassword() == null || registrationDto.getConfirmPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Password and confirm password are required"
            ));
        }
        
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Passwords do not match"
            ));
        }
        
        if (result.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Validation errors occurred");
            errorResponse.put("errors", result.getAllErrors());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            // Get the current admin user
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
            
            userService.createUser(registrationDto, adminUser);
            return ResponseEntity.ok(Map.of(
                "message", "User registered successfully!",
                "success", true
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Registration failed: " + e.getMessage()
            ));
        }
    }
}