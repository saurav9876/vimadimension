package org.example.controller;

import org.example.models.Project;
import org.example.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute; // Added
import org.springframework.web.bind.annotation.PostMapping;    // Added
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public String listProjects(Model model) {
        List<Project> projects = projectService.getAllProjects();
        model.addAttribute("projects", projects);
        return "projects/list-projects";
    }

    // === NEW METHODS FOR CREATING PROJECTS ===

    /**
     * Displays the form to create a new project.
     * Maps to GET /projects/new
     */
    @GetMapping("/new")
    public String showCreateProjectForm(Model model) {
        // Create a new Project object to bind form data
        model.addAttribute("project", new Project());
        return "projects/create-project-form"; // Thymeleaf template name
    }

    /**
     * Handles the submission of the new project form.
     * Maps to POST /projects
     */
    @PostMapping // No path specified, so it defaults to the class-level @RequestMapping ("/projects")
    public String createProject(@ModelAttribute("project") Project project) {
        // The @ModelAttribute "project" will be populated with data from the form.
        // Spring automatically binds form fields to the Project object's properties
        // if the form field names match the property names.

        projectService.createProject(project); // Save the new project

        return "redirect:/projects"; // Redirect to the project list page after creation
    }

    // === END OF NEW METHODS ===

}