package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/login",       // Permit access to the login URL
                                "/register",    // Permit access to the registration URL
                                "/css/**",      // Permit CSS files
                                "/js/**",       // Permit JavaScript files
                                "/images/**"    // Permit image files
                        ).permitAll()
                        .requestMatchers("/").permitAll() // If you have a public home page
                        .anyRequest().authenticated() // All other requests need authentication
                )
                .formLogin(form -> form
                        .loginPage("/login")             // URL of your custom login page
                        .loginProcessingUrl("/login")    // URL Spring Security handles for POSTed credentials
                        .defaultSuccessUrl("/projects", true) // Redirect on successful login
                        .failureUrl("/login?error=true")      // Redirect on failed login
                        .permitAll()                     // Allow everyone to access the loginPage and failureUrl
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                        .logoutSuccessUrl("/login?logout=true")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }
}