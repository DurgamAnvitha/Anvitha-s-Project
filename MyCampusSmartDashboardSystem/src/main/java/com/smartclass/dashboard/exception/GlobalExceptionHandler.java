package com.smartclass.dashboard.exception;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleStudentNotFound(
            StudentNotFoundException ex
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                        "timestamp", LocalDateTime.now(),
                        "message", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(AttendanceAlreadyMarkedException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateAttendance(
            AttendanceAlreadyMarkedException ex
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                        "timestamp", LocalDateTime.now(),
                        "message", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateKey(
            DuplicateKeyException ex
    ) {
        String msg = "A record with this unique field (e.g. RFID UID) already exists. Please use a different value.";
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                        "timestamp", LocalDateTime.now(),
                        "message", msg
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex
    ) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                        "timestamp", LocalDateTime.now(),
                        "message", ex.getMessage() != null ? ex.getMessage() : "Unknown error occurred"
                )
        );
    }
}
