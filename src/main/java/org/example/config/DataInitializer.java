package org.example.config;

import org.example.models.Role;
import org.example.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            createRoleIfNotFound(roleRepository, "ROLE_USER");    // If you still use a basic user role
            createRoleIfNotFound(roleRepository, "ROLE_MANAGER");
            createRoleIfNotFound(roleRepository, "ROLE_ADMIN");
        };
    }

    private void createRoleIfNotFound(RoleRepository roleRepository, String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(new Role(roleName));
            logger.info("Created role: {}", roleName);
        }
    }
}