package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")

public class DataCleanupController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private GradesRepository gradesRepository;
    @Autowired private TimetableRepository timetableRepository;
    @Autowired private LibraryBookRepository libraryBookRepository;
    @Autowired private LibraryIssueRepository libraryIssueRepository;
    @Autowired private UserRepository userRepository;

    /**
     * DELETE /api/admin/clear-all
     * Clears all collections except users.
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllData() {
        studentRepository.deleteAll();
        attendanceRepository.deleteAll();
        gradesRepository.deleteAll();
        timetableRepository.deleteAll();
        libraryBookRepository.deleteAll();
        libraryIssueRepository.deleteAll();

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "All collections cleared successfully (users preserved).");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/clear-users
     * Clears only the users collection (for re-registration).
     */
    @DeleteMapping("/clear-users")
    public ResponseEntity<Map<String, String>> clearUsers() {
        userRepository.deleteAll();

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "All users cleared.");
        return ResponseEntity.ok(response);
    }
}
