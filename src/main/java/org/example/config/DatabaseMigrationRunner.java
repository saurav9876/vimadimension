package org.example.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationRunner.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            // Check if project_id column allows NULL values
            String checkNullableQuery = """
                SELECT IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'tasks' 
                AND COLUMN_NAME = 'project_id'
                """;
            
            String isNullable = jdbcTemplate.queryForObject(checkNullableQuery, String.class);
            
            if ("NO".equals(isNullable)) {
                logger.info("Updating project_id column to allow NULL values for standalone tasks...");
                
                // Modify the project_id column to allow NULL values
                String alterQuery = "ALTER TABLE tasks MODIFY COLUMN project_id BIGINT NULL";
                jdbcTemplate.execute(alterQuery);
                
                logger.info("Successfully updated project_id column to allow NULL values");
            } else {
                logger.info("project_id column already allows NULL values");
            }
            
        } catch (Exception e) {
            logger.error("Error updating database schema: {}", e.getMessage(), e);
            // Don't fail the application startup, just log the error
        }
    }
}

