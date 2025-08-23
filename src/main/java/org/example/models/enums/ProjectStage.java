package org.example.models.enums;

public enum ProjectStage {
    STAGE_01_PREPARATION_BRIEF("Stage 01: Preparation & Brief"),
    STAGE_02_CONCEPT_DESIGN("Stage 02: Concept Design"),
    STAGE_03_DESIGN_DEVELOPMENT("Stage 03: Design Development"),
    STAGE_04_TECHNICAL_DESIGN("Stage 04: Technical Design"),
    STAGE_05_CONSTRUCTION("Stage 05: Construction"),
    STAGE_06_HANDOVER("Stage 06: Handover"),
    STAGE_07_USE("Stage 07: Use");

    private final String displayName;

    ProjectStage(String displayName) {
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
