package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.*;
import com.smartclass.dashboard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class StudentDashboardController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private QueryRepository queryRepo;
    @Autowired private SubmissionRepository submissionRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private TimetableRepository timetableRepo;
    @Autowired private PlacementDriveRepository driveRepo;
    @Autowired private GradesRepository gradesRepo;
    @Autowired private LibraryIssueRepository libraryRepo;
    @Autowired private FeeRepository feeRepo;

    @GetMapping("/student")
    public Map<String, Object> getStudentDashboard(@RequestParam String identifier) {
        try {
            Map<String, Object> data = new HashMap<>();
            
            // 1. Find Student
            Optional<Student> studentOpt = studentRepo.findByEmail(identifier);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepo.findByRollNo(identifier);
            }
            
            if (studentOpt.isEmpty()) return null;
            Student s = studentOpt.get();
            data.put("student", s);

            // 2. Metrics 
            // Books lent (Issued books)
            List<LibraryIssue> issued = libraryRepo.findByStudentIdAndStatus(s.getId(), "ISSUED");
            data.put("booksLentCount", issued.size());
            data.put("issuedBooks", issued);

            // Fee Pending
            List<Fee> fees = feeRepo.findByStudentId(s.getId());
            double totalPending = fees.stream()
                .filter(f -> !"PAID".equals(f.getStatus()))
                .mapToDouble(Fee::getPendingAmount)
                .sum();
            data.put("pendingFeeAmount", totalPending);
            data.put("fees", fees);
            
            long totalAtt = attendanceRepo.countByStudent(s);
            long presentAtt = attendanceRepo.countByStudentAndStatus(s, 'P');
            data.put("attendancePercent", totalAtt > 0 ? (int)((presentAtt * 100) / totalAtt) : 0);

            // 3. Timetable (Filtered for today)
            String today = LocalDate.now().getDayOfWeek().name();
            String dayOfWeek = today.charAt(0) + today.substring(1).toLowerCase();
            
            List<Timetable> slots = timetableRepo.findAll(); 
            List<Timetable> todaySlots = slots.stream()
                .filter(t -> (t.getSectionId() != null && t.getSectionId().equals(s.getSectionId())) || 
                            (t.getSection() != null && t.getSection().equalsIgnoreCase(s.getSectionName())))
                .filter(t -> t.getDay() != null && t.getDay().equalsIgnoreCase(dayOfWeek))
                .collect(Collectors.toList());
            data.put("todayClasses", todaySlots);

            // 4. Placement Drives
            data.put("placementDrives", driveRepo.findAll());

            // 5. Recent Grades
            List<Grades> studentGrades = gradesRepo.findByStudent(s);
            data.put("grades", studentGrades);

            return data;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
