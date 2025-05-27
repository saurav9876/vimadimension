package org.example.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// import jakarta.validation.constraints.DecimalMin;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.PastOrPresent;
// import jakarta.validation.constraints.Size;

public class TimeLogDto {

    // @NotNull(message = "Task ID cannot be null")
    private Long taskId;

    // @NotNull(message = "Date logged cannot be null")
    // @PastOrPresent(message = "Date logged must be in the past or present")
    private LocalDate dateLogged;

    // @NotNull(message = "Hours logged cannot be null")
    // @DecimalMin(value = "0.01", message = "Hours logged must be positive") // Or 0.25 for 15-min increments
    private BigDecimal hoursLogged;

    // @NotBlank(message = "Work description cannot be blank")
    // @Size(min = 5, max = 2000, message = "Work description must be between 5 and 2000 characters")
    private String workDescription;

    // userId will typically be derived from the authenticated user in the service layer

    // Getters and Setters
    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public LocalDate getDateLogged() {
        return dateLogged;
    }

    public void setDateLogged(LocalDate dateLogged) {
        this.dateLogged = dateLogged;
    }

    public BigDecimal getHoursLogged() {
        return hoursLogged;
    }

    public void setHoursLogged(BigDecimal hoursLogged) {
        this.hoursLogged = hoursLogged;
    }

    public String getWorkDescription() {
        return workDescription;
    }

    public void setWorkDescription(String workDescription) {
        this.workDescription = workDescription;
    }
}