package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Attendance;
import com.smartclass.dashboard.entity.Student;
import com.smartclass.dashboard.exception.AttendanceAlreadyMarkedException;
import com.smartclass.dashboard.exception.StudentNotFoundException;
import com.smartclass.dashboard.repository.AttendanceRepository;
import com.smartclass.dashboard.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceController(AttendanceRepository attendanceRepository,
                                StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =========================
    // MARK ATTENDANCE (RFID)
    // =========================
    @PostMapping("/mark-rfid")
    public Attendance markAttendanceRfid(
            @RequestParam String rfidUid,
            @RequestParam String subject,
            @RequestParam char status
    ) {
        Student student = studentRepository.findByRfidUid(rfidUid);
        if (student == null) throw new StudentNotFoundException("Student not found for RFID: " + rfidUid);
        return saveOrUpdateAttendance(student, subject, status, false);
    }

    // =========================
    // MARK ATTENDANCE (MANUAL)
    // =========================
    @PostMapping("/mark-manual")
    public Attendance markAttendanceManual(@RequestBody Map<String, Object> data) {
        String studentId = (String) data.get("studentId");
        String subject = (String) data.get("subject");
        String statusStr = (String) data.get("status");
        char status = (statusStr != null && !statusStr.isEmpty()) ? statusStr.charAt(0) : 'P';

        Student student = studentRepository.findById(studentId).orElseThrow(() -> new StudentNotFoundException("Student ID not found: " + studentId));
        return saveOrUpdateAttendance(student, subject, status, false);
    }
    
    // Admin Override Endpoint
    @PostMapping("/admin-update")
    public Attendance adminUpdateAttendance(@RequestBody Map<String, Object> data) {
        String studentId = (String) data.get("studentId");
        String subject = (String) data.get("subject");
        String statusStr = (String) data.get("status");
        char status = (statusStr != null && !statusStr.isEmpty()) ? statusStr.charAt(0) : 'P';

        Student student = studentRepository.findById(studentId).orElseThrow(() -> new StudentNotFoundException("Student ID not found: " + studentId));
        return saveOrUpdateAttendance(student, subject, status, true);
    }

    private Attendance saveOrUpdateAttendance(Student student, String subject, char status, boolean isAdmin) {
        LocalDate today = LocalDate.now();
        List<Attendance> existing = attendanceRepository.findByStudentAndSubject(student, subject);
        
        // Find if already marked for today
        Attendance record = existing.stream()
                .filter(a -> a.getDate().equals(today))
                .findFirst()
                .orElse(null);

        if (record != null) {
            if (!isAdmin) {
                // If it already exists and this is not an admin override, throw exception
                throw new AttendanceAlreadyMarkedException("Attendance for " + student.getName() + " in " + subject + " is already marked for today.");
            }
        } else {
            record = new Attendance();
        }

        record.setStudent(student);
        record.setSubject(subject);
        record.setDate(today);
        record.setStatus(status);
        record.setTimestamp(LocalDateTime.now());

        return attendanceRepository.save(record);
    }

    @GetMapping("/percentage")
    public Map<String, Object> getAttendancePercentage(
            @RequestParam String rfidUid,
            @RequestParam String subject
    ) {
        Student student = studentRepository.findByRfidUid(rfidUid);
        if (student == null) throw new StudentNotFoundException("Student not found.");

        long totalClasses = attendanceRepository.countByStudentAndSubject(student, subject);
        if (totalClasses == 0) {
            return Map.of("studentName", student.getName(), "subjectName", subject, "totalClasses", 0, "presentClasses", 0, "attendancePercentage", 0.0);
        }

        long presentClasses = attendanceRepository.countByStudentAndSubjectAndStatus(student, subject, 'P');
        double percentage = (presentClasses * 100.0) / totalClasses;

        return Map.of("studentName", student.getName(), "subjectName", subject, "totalClasses", totalClasses, "presentClasses", presentClasses, "attendancePercentage", percentage);
    }
}
