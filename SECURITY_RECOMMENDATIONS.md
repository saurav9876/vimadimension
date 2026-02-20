# Security Recommendations – VimaDimension

This document identifies security vulnerabilities and weaknesses found in the codebase, ordered by severity.

---

## Critical

### 1. Unauthenticated Access to Admin, Project, and User Routes

**File:** `src/main/java/org/example/config/SecurityConfig.java:42`

```java
.requestMatchers("/projects/**", "/tasks/**", "/profile", "/users/**", "/admin/**").permitAll()
```

All frontend routes for projects, tasks, users, and the entire `/admin/**` path are publicly accessible without any authentication. Any anonymous visitor can reach these pages.

**Fix:** Change `permitAll()` to `authenticated()` for these paths:

```java
.requestMatchers("/projects/**", "/tasks/**", "/profile", "/users/**", "/admin/**").authenticated()
```

---

### 2. Broken Object-Level Authorization (IDOR) on Projects and Tasks

**Files:**
- `src/main/java/org/example/controller/ProjectController.java:172` (`showProjectDetails`)
- `src/main/java/org/example/controller/ProjectController.java:215` (`showUpdateProjectForm`)
- `src/main/java/org/example/controller/ProjectController.java:247` (`updateProject`)
- `src/main/java/org/example/controller/ProjectController.java:271` (`deleteProject`)
- `src/main/java/org/example/controller/TaskController.java:40` (`getTaskDetails`)
- `src/main/java/org/example/controller/TaskController.java:247` (`updateTask`)
- `src/main/java/org/example/controller/TaskController.java:376` (`deleteTask`)

None of these endpoints verify that the requesting user belongs to the same organization as the resource being accessed. Any authenticated user can view, edit, or delete any project or task by supplying a known or guessed ID.

**Fix:** After loading the resource, check that `resource.getOrganization().getId()` matches the organization of the authenticated user, the same pattern already applied correctly in `AdminController.getUser()`.

---

### 3. CSRF Protection Disabled for All API Endpoints

**File:** `src/main/java/org/example/config/SecurityConfig.java:61-63`

```java
.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/**") // Disable CSRF for API endpoints
)
```

The API uses session-based authentication (cookies). Disabling CSRF for the entire `/api/**` namespace means every state-changing endpoint (`/api/admin/users`, `/api/projects/save`, `/api/auth/logout`, etc.) is vulnerable to cross-site request forgery attacks.

**Fix:** Remove the `ignoringRequestMatchers` rule and let Spring Security enforce CSRF tokens. For the login endpoint specifically (`/api/auth/login`), use the built-in form login mechanism which already manages CSRF. If a fully stateless API is preferred, replace cookie-based sessions with short-lived JWTs — then CSRF is no longer relevant and the exemption is safe.

---

### 4. Session ID Returned in Login Response Body

**File:** `src/main/java/org/example/controller/ApiAuthController.java:77`

```java
response.put("sessionId", session.getId());
```

The session identifier is placed directly in the JSON response body. Any JavaScript running on the page (including injected scripts) can read it, making it susceptible to session hijacking.

**Fix:** Remove `sessionId` from the response. The browser already receives the session cookie via the `Set-Cookie` header; the client does not need to read the session ID explicitly.

---

## High

### 5. Attendance Export Endpoints Missing Organization Ownership Check

**File:** `src/main/java/org/example/controller/AdminController.java:313-400`

The `/api/admin/users/{userId}/attendance` and export endpoints verify that the user ID exists but do not verify that the user belongs to the requesting admin's organization. An admin from Organization A can export attendance data for users belonging to Organization B.

**Fix:** Add the same organization check used in `AdminController.getUser()` (lines 195-202) to both the attendance and export endpoints.

---

### 6. Arbitrary Role Creation via Admin User-Create Endpoint

**File:** `src/main/java/org/example/service/UserService.java:101-106`

```java
Role userRole = roleRepository.findByName(userDto.getRole())
        .orElseGet(() -> {
            Role newRole = new Role(userDto.getRole());
            return roleRepository.save(newRole);
        });
```

When an admin creates a user with a role name that does not exist, the service silently creates that role in the database. An admin can introduce arbitrary role strings (e.g., `ROLE_SUPERUSER`) that have no defined access rules, creating privilege confusion.

**Fix:** Replace `orElseGet` with `orElseThrow` and maintain a whitelist of permitted role names (`ROLE_USER`, `ROLE_MANAGER`, `ROLE_ADMIN`):

```java
Role userRole = roleRepository.findByName(userDto.getRole())
        .orElseThrow(() -> new IllegalArgumentException("Invalid role: " + userDto.getRole()));
```

---

### 7. No Rate Limiting or Account Lockout on Login Endpoint

**File:** `src/main/java/org/example/controller/ApiAuthController.java:41`

The `/api/auth/login` endpoint and the form-based login page have no brute-force protection. An attacker can attempt unlimited password guesses.

**Fix:** Add Spring Security's `DefaultAuthenticationEventPublisher` or a custom `AuthenticationFailureHandler` to track failed attempts per username/IP and temporarily lock the account or introduce a delay after a configurable threshold (e.g., 5 failures).

---

### 8. Sensitive Internal Errors Exposed to Clients

**Files:**
- `src/main/java/org/example/controller/ProfileController.java:86` — `"Failed to change password: " + e.getMessage()`
- `src/main/java/org/example/controller/OrganizationRegistrationController.java:109` — `"Registration failed: " + e.getMessage()`
- `src/main/java/org/example/controller/ApiAuthController.java:91` — `"Login failed: " + e.getMessage()`

Raw exception messages can expose stack traces, class names, SQL query fragments, or configuration details to clients.

**Fix:** Return a generic error message to the client and log the full exception server-side:

```java
logger.error("Error changing password for user", e);
return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred"));
```

---

## Medium

### 9. Development Logging Settings Active in Default Profile

**File:** `src/main/resources/application.properties:7,12`

```properties
logging.level.org.example.service.UserDetailsServiceImpl=DEBUG
logging.level.org.springframework.security=DEBUG
```

Spring Security debug logging outputs full authentication details, granted authorities, and security decision traces. These lines apply to every environment that does not explicitly override them (local, CI, staging).

**Fix:** Move these debug lines into a dedicated `application-dev.properties` profile and ensure they are absent in `application-prod.properties`.

Also remove `spring.jpa.show-sql=true` and `spring.jpa.properties.hibernate.format_sql=true` from the default profile.

---

### 10. Session ID Printed to stdout

**File:** `src/main/java/org/example/controller/ApiAuthController.java:63-64,70-72,98-99`

```java
System.out.println("Session created: " + session.getId());
System.out.println("Authentication saved to session: " + authentication.getName());
System.out.println("Session ID after save: " + session.getId());
```

`System.out` bypasses the logging framework, cannot be filtered by log level, and writes session identifiers to any log aggregator that captures stdout.

**Fix:** Replace all `System.out.println` calls with `logger.debug(...)` and remove session ID from the log message. Same applies to `System.err.println` in the catch block on line 131.

---

### 11. Weak Password Policy

**Files:**
- `src/main/java/org/example/service/UserService.java:287-289`
- `src/main/java/org/example/controller/ProfileController.java:47-52`

The minimum password length is 6 characters with no complexity requirements (no uppercase, digits, or special characters enforced).

**Fix:** Require a minimum of 8 characters and at least one character from two or more character classes. Consider integrating a password strength library. Enforce this consistently in `UserService` rather than in controllers.

---

### 12. Hardcoded Placeholder Credentials in Production Config

**File:** `src/main/resources/application-prod.properties:21-22`

```properties
spring.security.user.name=admin
spring.security.user.password=your_admin_password
```

This configures Spring Security's in-memory default user with a placeholder password. Even if this account is unused in practice, a deployment that forgets to override the password via environment variable exposes a known admin account.

**Fix:** Remove these lines entirely. The application manages users through the database; the Spring Boot auto-configured in-memory user should be disabled by providing a custom `UserDetailsService` bean (which this application already does). Add the following to `application-prod.properties` to disable the auto-configured user explicitly:

```properties
spring.security.user.name=
spring.security.user.password=
```

Or use `spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration`.

---

### 13. Missing Input Validation on Organization Registration

**File:** `src/main/java/org/example/controller/OrganizationRegistrationController.java:36`

The `registerOrganization` endpoint receives a raw `OrganizationRegistrationRequest` object without `@Valid` annotation and the DTO fields have no `@NotBlank`, `@Email`, `@Size`, or `@Pattern` constraints. There is no password strength check for the initial admin password.

**Fix:** Add Bean Validation annotations to `OrganizationRegistrationRequest` fields and annotate the parameter with `@Valid`:

```java
public ResponseEntity<?> registerOrganization(@Valid @RequestBody OrganizationRegistrationRequest request)
```

---

### 14. `/api/projects/health` Endpoint Unauthenticated and Information-Leaking

**File:** `src/main/java/org/example/controller/ProjectController.java:43-62`

This endpoint is reachable without authentication (because `/api/**` requires auth but there is no explicit permit for this path — however the session-based auth check at line 78 only applies to the list endpoint). More importantly, it leaks the total project count and on failure returns the raw exception message.

**Fix:** Restrict the health endpoint to admin users or remove it and rely on Spring Actuator's `/actuator/health` which is already correctly configured.

---

### 15. Missing HTTP Security Response Headers

**File:** `src/main/java/org/example/config/SecurityConfig.java`

Spring Security enables some default headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`) but the current configuration does not define an explicit Content Security Policy (CSP), `Referrer-Policy`, or `Permissions-Policy`.

**Fix:** Add an explicit header configuration:

```java
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
        .policyDirectives("default-src 'self'; script-src 'self'; object-src 'none'"))
    .referrerPolicy(referrer -> referrer
        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
);
```

---

## Low

### 16. Email Format Not Validated on Profile Update

**File:** `src/main/java/org/example/controller/ProfileController.java:106-111`

The `updateProfile` endpoint checks only that the email field is not empty; it does not validate that the value is a valid email address format.

**Fix:** Add `@Email` annotation to the DTO or validate with a regex/`jakarta.validation` constraint in the service layer.

---

### 17. `ddl-auto=update` in Default Application Properties

**File:** `src/main/resources/application.properties:46`

`spring.jpa.hibernate.ddl-auto=update` allows Hibernate to modify the database schema at startup. This setting is appropriate only for local development and can cause irreversible schema changes if mistakenly applied to a shared or production database.

**Fix:** Set `spring.jpa.hibernate.ddl-auto=validate` in the default profile and use a schema migration tool (Flyway or Liquibase) for controlled schema changes.

---

## Summary Table

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | Admin/project/task routes publicly accessible | Critical | `SecurityConfig.java:42` |
| 2 | IDOR – no org ownership check on resources | Critical | `ProjectController`, `TaskController` |
| 3 | CSRF disabled for all API endpoints | Critical | `SecurityConfig.java:61` |
| 4 | Session ID returned in response body | Critical | `ApiAuthController.java:77` |
| 5 | Admin attendance export missing org check | High | `AdminController.java:313` |
| 6 | Arbitrary role creation by admin | High | `UserService.java:101` |
| 7 | No rate limiting / account lockout on login | High | `ApiAuthController.java:41` |
| 8 | Raw exception messages sent to clients | High | Multiple controllers |
| 9 | Debug logging active in default profile | Medium | `application.properties:7,12` |
| 10 | Session ID printed to stdout | Medium | `ApiAuthController.java:63` |
| 11 | Weak password policy (min 6 chars) | Medium | `UserService.java:287` |
| 12 | Hardcoded placeholder creds in prod config | Medium | `application-prod.properties:21` |
| 13 | No input validation on org registration | Medium | `OrganizationRegistrationController.java:36` |
| 14 | Unauthenticated health endpoint leaks data | Medium | `ProjectController.java:43` |
| 15 | Missing Content Security Policy headers | Medium | `SecurityConfig.java` |
| 16 | Email format not validated on profile update | Low | `ProfileController.java:106` |
| 17 | `ddl-auto=update` in default profile | Low | `application.properties:46` |
