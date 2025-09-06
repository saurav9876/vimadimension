package org.example.models.enums;

public enum TaskPriority {
    LOW("Low", "priority-low"),
    MEDIUM("Medium", "priority-medium"),
    HIGH("High", "priority-high"),
    URGENT("Urgent", "priority-urgent");

    private final String displayName;
    private final String cssClass;

    TaskPriority(String displayName, String cssClass) {
        this.displayName = displayName;
        this.cssClass = cssClass;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCssClass() {
        return cssClass;
    }
}

