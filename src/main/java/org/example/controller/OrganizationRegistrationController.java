package org.example.controller;

import org.example.models.Organization;
import org.example.models.Role;
import org.example.models.User;
import org.example.repository.OrganizationRepository;
import org.example.repository.RoleRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/organization")
public class OrganizationRegistrationController {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerOrganization(@RequestBody OrganizationRegistrationRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate organization name uniqueness
            if (organizationRepository.existsByName(request.getOrganizationName())) {
                response.put("success", false);
                response.put("message", "Organization name already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate organization email uniqueness
            if (organizationRepository.existsByContactEmail(request.getOrganizationEmail())) {
                response.put("success", false);
                response.put("message", "Organization email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate admin username uniqueness
            if (userRepository.existsByUsername(request.getAdminUsername())) {
                response.put("success", false);
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate admin email uniqueness
            if (userRepository.existsByEmail(request.getAdminEmail())) {
                response.put("success", false);
                response.put("message", "Admin email already exists");
                return ResponseEntity.badRequest().body(response);
            }

            // Create organization
            Organization organization = new Organization();
            organization.setName(request.getOrganizationName());
            organization.setDescription(request.getOrganizationDescription());
            organization.setContactEmail(request.getOrganizationEmail());
            organization.setContactPhone(request.getOrganizationPhone());
            organization.setAddress(request.getOrganizationAddress());
            organization.setWebsite(request.getOrganizationWebsite());

            Organization savedOrganization = organizationRepository.save(organization);

            // Get ADMIN role
            Optional<Role> adminRole = roleRepository.findByName("ROLE_ADMIN");
            if (!adminRole.isPresent()) {
                response.put("success", false);
                response.put("message", "Admin role not found in system");
                return ResponseEntity.internalServerError().body(response);
            }

            // Create admin user
            User adminUser = new User();
            adminUser.setUsername(request.getAdminUsername());
            adminUser.setName(request.getAdminName()); // Add the name field
            adminUser.setEmail(request.getAdminEmail());
            adminUser.setPassword(passwordEncoder.encode(request.getAdminPassword()));
            adminUser.setDesignation(request.getAdminDesignation());
            adminUser.setSpecialization(request.getAdminSpecialization());
            adminUser.setEnabled(true);
            adminUser.setOrganization(savedOrganization);
            adminUser.setRoles(Set.of(adminRole.get()));

            userRepository.save(adminUser);

            response.put("success", true);
            response.put("message", "Organization and admin user registered successfully");
            response.put("organizationId", savedOrganization.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    public static class OrganizationRegistrationRequest {
        private String organizationName;
        private String organizationDescription;
        private String organizationEmail;
        private String organizationPhone;
        private String organizationAddress;
        private String organizationWebsite;
        private String adminName;
        private String adminUsername;
        private String adminEmail;
        private String adminPassword;
        private String adminDesignation;
        private String adminSpecialization;

        // Getters and setters
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

        public String getOrganizationDescription() { return organizationDescription; }
        public void setOrganizationDescription(String organizationDescription) { this.organizationDescription = organizationDescription; }

        public String getOrganizationEmail() { return organizationEmail; }
        public void setOrganizationEmail(String organizationEmail) { this.organizationEmail = organizationEmail; }

        public String getOrganizationPhone() { return organizationPhone; }
        public void setOrganizationPhone(String organizationPhone) { this.organizationPhone = organizationPhone; }

        public String getOrganizationAddress() { return organizationAddress; }
        public void setOrganizationAddress(String organizationAddress) { this.organizationAddress = organizationAddress; }

        public String getOrganizationWebsite() { return organizationWebsite; }
        public void setOrganizationWebsite(String organizationWebsite) { this.organizationWebsite = organizationWebsite; }

        public String getAdminName() { return adminName; }
        public void setAdminName(String adminName) { this.adminName = adminName; }

        public String getAdminUsername() { return adminUsername; }
        public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }

        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

        public String getAdminPassword() { return adminPassword; }
        public void setAdminPassword(String adminPassword) { this.adminPassword = adminPassword; }

        public String getAdminDesignation() { return adminDesignation; }
        public void setAdminDesignation(String adminDesignation) { this.adminDesignation = adminDesignation; }

        public String getAdminSpecialization() { return adminSpecialization; }
        public void setAdminSpecialization(String adminSpecialization) { this.adminSpecialization = adminSpecialization; }
    }
}