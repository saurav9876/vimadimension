package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VimaDimensionApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(VimaDimensionApplication.class);
        application.setWebApplicationType(WebApplicationType.SERVLET); // Add this line
        application.run(args);
    }

}