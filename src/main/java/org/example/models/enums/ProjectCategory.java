package org.example.models.enums;

public enum ProjectCategory {
    ARCHITECTURE("Architecture"),
    INTERIOR("Interior"),
    STRUCTURE("Structure"),
    URBAN("Urban"),
    LANDSCAPE("Landscape"),
    ACOUSTIC("Acoustic"),
    OTHER("Other");

    private final String displayName;

    ProjectCategory(String displayName) {
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
