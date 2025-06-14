package org.example.service; // Or org.example.service if you placed it there

import org.example.models.Role; // Make sure this import is present if not already
import org.example.models.User;
import org.example.repository.UserRepository;
import org.slf4j.Logger; // Import SLF4J Logger
import org.slf4j.LoggerFactory; // Import SLF4J LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Ensure this is the correct import
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class); // Add logger

    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // System.out.println("!!! UserDetailsServiceImpl.loadUserByUsername CALLED with username: " + username + " !!!"); // Temporary test
        logger.info("Attempting to load user by username: {}", username); // Log attempt

        // It's good practice to normalize the username if it's stored normalized
        // String normalizedUsername = username.trim().toLowerCase();
        // User user = userRepository.findByUsername(normalizedUsername)
        User user = userRepository.findByUsername(username) // Assuming username is already handled consistently
                .orElseThrow(() -> {
                    logger.warn("User not found with username: {}", username); // Log if not found
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        logger.info("User found: {}. Enabled: {}. Password (encoded): {}",
                user.getUsername(), user.isEnabled(), user.getPassword() != null ? "[PRESENT]" : "[NULL_OR_EMPTY]");
        // Be careful not to log the actual encoded password in production for too long,
        // but "[PRESENT]" or its length can be useful for debugging.

        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            logger.error("User {} has a null or empty password in the database!", user.getUsername());
            // This would definitely cause authentication failure.
            // Spring Security expects a non-null encoded password.
            throw new UsernameNotFoundException("User account is misconfigured (no password): " + username);
        }

        // --- The Key Change is Here ---
        // Assuming your Role entity has a getName() method that returns the role string (e.g., "ROLE_USER")
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> {
                    logger.debug("Mapping role: {} for user: {}", role.getName(), username); // Log the role name
                    return new SimpleGrantedAuthority(role.getName()); // Use role.getName()
                })
                .collect(Collectors.toSet());

        if (authorities.isEmpty()) {
            logger.warn("User {} has no roles assigned. This might be intended or an issue depending on security configuration.", username);
            // Depending on your security rules, this might be an issue,
            // but usually doesn't directly cause "Invalid username/password"
            // unless authorization rules prevent login without roles.
        } else {
            logger.info("User {} has authorities: {}", username, authorities);
        }


        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(), // This MUST be the encoded password from your database
                user.isEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities);
    }
}