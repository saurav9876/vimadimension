package org.example.models.enums;

public enum ProjectPriority {
    LOW("Low", "low-priority"),
    MEDIUM("Medium", "medium-priority"),
    HIGH("High", "high-priority"),
    URGENT("Urgent", "urgent-priority");

    private final String displayName;
    private final String cssClass;

    ProjectPriority(String displayName, String cssClass) {
        this.displayName = displayName;
        this.cssClass = cssClass;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCssClass() {
        return cssClass;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
