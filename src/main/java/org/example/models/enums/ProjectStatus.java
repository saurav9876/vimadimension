package org.example.models.enums;

public enum ProjectStatus {
    IN_DISCUSSION("In discussion"),
    PROGRESS("Progress"),
    ON_HOLD("On hold"),
    COMPLETED("Completed"),
    ARCHIVED("Archived");

    private final String displayName;

    ProjectStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
