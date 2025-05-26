package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    @GetMapping("/login")
    public String loginPage() {
        // This tells Thymeleaf to look for login.html inside the 'projects' subdirectory
        // of your templates folder (e.g., src/main/resources/templates/projects/login.html)
        return "projects/login";
    }

    // You can also add your @GetMapping for /register here if it's not already
    // in RegistrationController, or ensure RegistrationController correctly
    // returns "projects/register" if register.html is also in that subfolder.
    // For example:
    // @GetMapping("/register")
    // public String registrationPage() {
    //     return "projects/register"; // If register.html is also in templates/projects/
    // }
}
