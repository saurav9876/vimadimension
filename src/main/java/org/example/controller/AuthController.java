package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AuthController {

    // Serve React app for specific frontend routes only
    // Avoid /** patterns that might interfere with API endpoints
    @GetMapping({"/", "/login", "/register"})
    public String serveReactApp() {
        return "forward:/index.html";
    }
    
    // Handle specific React routes without using /** patterns
    @GetMapping({"/projects", "/projects/new"})
    public String serveProjectRoutes() {
        return "forward:/index.html";
    }
    
    @GetMapping({"/tasks"})
    public String serveTaskRoutes() {
        return "forward:/index.html";
    }
    
    @GetMapping({"/profile", "/admin", "/users"})
    public String serveOtherRoutes() {
        return "forward:/index.html";
    }
}
