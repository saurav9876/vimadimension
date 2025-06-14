package org.example.controller;

import org.example.models.User;
import org.example.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/profile")
public class UserProfileController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);
    private final UserService userService;

    @Autowired
    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public String showUserProfile(Model model, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }
        String username = authentication.getName();
        logger.debug("Fetching profile for user: {}", username);

        User user = userService.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("User not found during profile fetch: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        // The accessibleProjects should be fetched if LAZY.
        // If using Hibernate, accessing user.getAccessibleProjects() within a transactional
        // service method or ensuring the session is open is important.
        // For simplicity, if UserService.findByUsername fetches them eagerly or
        // you have a separate method like userService.findUserWithAccessibleProjects(username)
        // that would be ideal.

        model.addAttribute("user", user);
        // No need to add accessibleProjects separately if it's part of the User object
        // and fetched correctly.
        return "users/user-profile"; // Path to your Thymeleaf template
    }

    // In your UserProfileController.java
    @GetMapping("/profile")
    public String userProfile(Model model, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/login";
        }
        String username = authentication.getName();
        // Use the service method that initializes collections
        User user = userService.findByUsernameForProfile(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        model.addAttribute("user", user);
        return "users/user-profile";
    }
}