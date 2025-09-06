package org.example.models.enums;

public enum TaskStatus {
    TO_DO("To Do"),
    IN_PROGRESS("In Progress"),
    IN_REVIEW("In Review"), // Optional
    DONE("Done"),
    CHECKED("Checked"),
    ON_HOLD("On Hold"); // Optional

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
