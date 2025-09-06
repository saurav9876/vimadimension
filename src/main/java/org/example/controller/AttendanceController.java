package org.example.controller;

import org.example.models.AttendanceEntry;
import org.example.models.User;
import org.example.repository.AttendanceEntryRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceEntryRepository attendanceEntryRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/clock-in")
    public ResponseEntity<?> clockIn(@RequestBody(required = false) Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            // Check if user is already clocked in today
            Optional<AttendanceEntry> latestEntry = attendanceEntryRepository.findLatestByUserId(user.getId());
            if (latestEntry.isPresent() && 
                latestEntry.get().getEntryType() == AttendanceEntry.EntryType.CLOCK_IN &&
                latestEntry.get().getTimestamp().toLocalDate().equals(LocalDate.now())) {
                response.put("success", false);
                response.put("message", "You are already clocked in for today");
                response.put("lastClockIn", latestEntry.get().getTimestamp());
                return ResponseEntity.badRequest().body(response);
            }

            String notes = requestBody != null ? requestBody.get("notes") : null;
            
            AttendanceEntry entry = new AttendanceEntry(
                user, 
                AttendanceEntry.EntryType.CLOCK_IN, 
                LocalDateTime.now(), 
                notes
            );
            
            AttendanceEntry savedEntry = attendanceEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Successfully clocked in");
            response.put("entry", savedEntry);
            response.put("timestamp", savedEntry.getTimestamp());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to clock in: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/clock-out")
    public ResponseEntity<?> clockOut(@RequestBody(required = false) Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            // Check if user is clocked in (last entry should be CLOCK_IN)
            Optional<AttendanceEntry> latestEntry = attendanceEntryRepository.findLatestByUserId(user.getId());
            if (!latestEntry.isPresent() || 
                latestEntry.get().getEntryType() == AttendanceEntry.EntryType.CLOCK_OUT ||
                !latestEntry.get().getTimestamp().toLocalDate().equals(LocalDate.now())) {
                response.put("success", false);
                response.put("message", "You are not currently clocked in");
                return ResponseEntity.badRequest().body(response);
            }

            String notes = requestBody != null ? requestBody.get("notes") : null;
            
            AttendanceEntry entry = new AttendanceEntry(
                user, 
                AttendanceEntry.EntryType.CLOCK_OUT, 
                LocalDateTime.now(), 
                notes
            );
            
            AttendanceEntry savedEntry = attendanceEntryRepository.save(entry);

            response.put("success", true);
            response.put("message", "Successfully clocked out");
            response.put("entry", savedEntry);
            response.put("timestamp", savedEntry.getTimestamp());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to clock out: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAttendanceStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            // Get today's entries to determine daily attendance status
            List<AttendanceEntry> todayEntries = attendanceEntryRepository.findByUserIdAndDate(
                user.getId(), LocalDate.now());
            
            Optional<AttendanceEntry> latestEntry = attendanceEntryRepository.findLatestByUserId(user.getId());
            
            boolean isClockedIn = latestEntry.isPresent() && 
                                  latestEntry.get().getEntryType() == AttendanceEntry.EntryType.CLOCK_IN &&
                                  latestEntry.get().getTimestamp().toLocalDate().equals(LocalDate.now());

            response.put("success", true);
            response.put("isClockedIn", isClockedIn);
            response.put("todayEntries", todayEntries);
            
            if (latestEntry.isPresent()) {
                response.put("lastEntry", latestEntry.get());
                response.put("lastEntryTimestamp", latestEntry.get().getTimestamp());
                response.put("lastEntryType", latestEntry.get().getEntryType());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get attendance status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getAttendanceHistory(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            List<AttendanceEntry> entries;
            
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime end = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
                entries = attendanceEntryRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                    user.getId(), start, end);
            } else {
                entries = attendanceEntryRepository.findByUserIdOrderByTimestampDesc(user.getId());
            }

            response.put("success", true);
            response.put("entries", entries);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get attendance history: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayAttendance() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userOptional.get();

            List<AttendanceEntry> todayEntries = attendanceEntryRepository.findByUserIdAndDate(
                user.getId(), LocalDate.now());

            response.put("success", true);
            response.put("entries", todayEntries);
            response.put("date", LocalDate.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get today's attendance: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}