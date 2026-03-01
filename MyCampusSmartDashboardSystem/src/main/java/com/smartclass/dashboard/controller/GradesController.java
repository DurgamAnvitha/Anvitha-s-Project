package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Grades;
import com.smartclass.dashboard.entity.Student;
import com.smartclass.dashboard.exception.StudentNotFoundException;
import com.smartclass.dashboard.repository.GradesRepository;
import com.smartclass.dashboard.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
public class GradesController {

    private final GradesRepository gradesRepository;
    private final StudentRepository studentRepository;

    public GradesController(GradesRepository gradesRepository,
                            StudentRepository studentRepository) {
        this.gradesRepository = gradesRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Grades> getAllGrades() {
        return gradesRepository.findAll();
    }

    @PostMapping
    public Grades addGrades(@RequestParam(required = false) String rfidUid, 
                           @RequestParam(required = false) String studentId,
                           @RequestBody Grades grades) {
        Student student = null;
        if (rfidUid != null) student = studentRepository.findByRfidUid(rfidUid);
        else if (studentId != null) student = studentRepository.findById(studentId).orElse(null);

        if (student == null) throw new StudentNotFoundException("Student not found.");
        grades.setStudent(student);
        return gradesRepository.save(grades);
    }

    @PutMapping("/{id}")
    public Grades updateGrades(@PathVariable String id, @RequestBody Grades updated) {
        Grades existing = gradesRepository.findById(id).orElseThrow();
        if (updated.getSubject() != null) existing.setSubject(updated.getSubject());
        if (updated.getGrade() != null) existing.setGrade(updated.getGrade());
        if (updated.getSemester() != 0) existing.setSemester(updated.getSemester());
        if (updated.getCredits() != 0) existing.setCredits(updated.getCredits());
        return gradesRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteGrades(@PathVariable String id) {
        gradesRepository.deleteById(id);
    }

    @GetMapping("/{rfidOrId}")
    public List<Grades> getGrades(@PathVariable String rfidOrId) {
        Student student = studentRepository.findByRfidUid(rfidOrId);
        if (student == null) student = studentRepository.findById(rfidOrId).orElse(null);
        if (student == null) throw new StudentNotFoundException("Student not found.");
        return gradesRepository.findByStudent(student);
    }

    @GetMapping("/gpa/{rfidOrId}")
    public double calculateGPA(@PathVariable String rfidOrId) {
        Student student = studentRepository.findByRfidUid(rfidOrId);
        if (student == null) student = studentRepository.findById(rfidOrId).orElse(null);
        if (student == null) throw new StudentNotFoundException("Student not found.");

        List<Grades> gradesList = gradesRepository.findByStudent(student);
        if (gradesList.isEmpty()) return 0.0;

        double totalPoints = 0;
        int totalCredits = 0;

        for (Grades g : gradesList) {
            double gradePoint = mapGradeToPoint(g.getGrade());
            totalPoints += gradePoint * g.getCredits();
            totalCredits += g.getCredits();
        }

        return totalCredits == 0 ? 0.0 : totalPoints / totalCredits;
    }

    private double mapGradeToPoint(String grade) {
        return switch (grade.toUpperCase()) {
            case "O", "A+" -> 10.0;
            case "A" -> 9.0;
            case "A-" -> 8.5;
            case "B+" -> 8.0;
            case "B" -> 7.0;
            case "B-" -> 6.5;
            case "C+" -> 6.0;
            case "C" -> 5.0;
            case "D" -> 4.0;
            default -> 0.0;
        };
    }
}
