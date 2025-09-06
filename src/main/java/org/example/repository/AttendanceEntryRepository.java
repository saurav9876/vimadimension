package org.example.repository;

import org.example.models.AttendanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceEntryRepository extends JpaRepository<AttendanceEntry, Long> {
    
    @Query("SELECT ae FROM AttendanceEntry ae WHERE ae.user.id = :userId ORDER BY ae.timestamp DESC")
    List<AttendanceEntry> findByUserIdOrderByTimestampDesc(@Param("userId") Long userId);
    
    @Query("SELECT ae FROM AttendanceEntry ae WHERE ae.user.id = :userId " +
           "AND ae.timestamp BETWEEN :startDateTime AND :endDateTime ORDER BY ae.timestamp DESC")
    List<AttendanceEntry> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
        @Param("userId") Long userId, 
        @Param("startDateTime") LocalDateTime startDateTime, 
        @Param("endDateTime") LocalDateTime endDateTime
    );
    
    @Query("SELECT ae FROM AttendanceEntry ae WHERE ae.user.id = :userId " +
           "AND DATE(ae.timestamp) = :date ORDER BY ae.timestamp DESC")
    List<AttendanceEntry> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT ae FROM AttendanceEntry ae WHERE ae.user.id = :userId " +
           "ORDER BY ae.timestamp DESC LIMIT 1")
    Optional<AttendanceEntry> findLatestByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ae FROM AttendanceEntry ae WHERE ae.user.id = :userId " +
           "AND ae.entryType = :entryType ORDER BY ae.timestamp DESC LIMIT 1")
    Optional<AttendanceEntry> findLatestByUserIdAndEntryType(
        @Param("userId") Long userId, 
        @Param("entryType") AttendanceEntry.EntryType entryType
    );
}