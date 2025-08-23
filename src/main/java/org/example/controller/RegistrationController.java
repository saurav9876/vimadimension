// /Users/sauravkejriwal/workspace/vimadimension/src/main/java/org/example/controller/RegistrationController.java
package org.example.controller;

import org.example.dto.UserRegistrationDto;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/register")
public class RegistrationController {

    private final UserService userService;

    @Autowired
    public RegistrationController(UserService userService) {
        this.userService = userService;
    }

    @ModelAttribute("user") // Ensures 'user' attribute is available in the model for the form
    public UserRegistrationDto userRegistrationDto() {
        return new UserRegistrationDto();
    }

    @GetMapping
    public String showRegistrationForm(Model model) {
        // The @ModelAttribute above already adds an empty DTO to the model
        // model.addAttribute("user", new UserRegistrationDto()); // This line is redundant due to @ModelAttribute
        return "projects/register"; // Name of the Thymeleaf template
    }

    @PostMapping
    public String registerUserAccount(@ModelAttribute("user") UserRegistrationDto registrationDto,
                                      RedirectAttributes redirectAttributes) {
        try {
            // TODO: This old controller is not used anymore since we switched to React
            // userService.registerNewUser(registrationDto);
            redirectAttributes.addFlashAttribute("registrationSuccess", "Registration successful! Please login.");
            return "redirect:/login"; // Redirect to login page on success
        } catch (Exception e) {
            // Add error message to be displayed on the registration form
            redirectAttributes.addFlashAttribute("registrationError", e.getMessage());
            return "redirect:/register?error"; // Redirect back to registration form with an error indication
        }
    }
}