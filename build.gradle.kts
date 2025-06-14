plugins {
    id("java")
    id("org.springframework.boot") version "3.2.0" // Apply Spring Boot plugin
    id("io.spring.dependency-management") version "1.1.4"
}

group = "org.example"
version = "1.0-SNAPSHOT"


// Add this block to specify the Java version for your project
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21)) // Or 21, if you prefer and your setup supports it
    }
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")

    // For Spring Data JPA
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security") // <-- ADD THIS LINE
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    // You'll also need a JDBC driver for your chosen database.
    // For example, if you're using PostgreSQL:
    // runtimeOnly("org.postgresql:postgresql")

    // Or for H2 (often used for development/testing):
    // runtimeOnly("com.h2database:h2")

    // Or for MySQL:
    runtimeOnly("com.mysql:mysql-connector-j")
}

tasks.test {
    useJUnitPlatform()
}