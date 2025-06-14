package org.example.controller;

import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/users") // Base path for admin user operations
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // This endpoint allows an existing admin to grant ROLE_ADMIN to another user.
    // You'd typically call this from an admin UI (e.g., a button next to a user in a list).
    @PostMapping("/{userId}/grant-admin")
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

    // You would likely have a GET mapping to display a user management page
    // @GetMapping("/user-management")
    // @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    // public String showUserManagementPage(Model model) {
    //     model.addAttribute("users", userService.findAllUsers()); // Example
    //     return "admin/user-management-page"; // Thymeleaf template
    // }
}