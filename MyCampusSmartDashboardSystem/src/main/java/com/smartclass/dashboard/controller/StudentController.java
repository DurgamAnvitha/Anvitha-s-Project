package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Student;
import com.smartclass.dashboard.entity.User;
import com.smartclass.dashboard.repository.StudentRepository;
import com.smartclass.dashboard.repository.UserRepository;
import com.smartclass.dashboard.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")

public class StudentController {

    @GetMapping("/debug/count")
    public long getCount() {
        return studentRepository.count();
    }

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        try {
            // Pre-save validation: check for duplicate RFID
            if (student.getRfidUid() != null && !student.getRfidUid().isBlank()) {
                Student existing = studentRepository.findByRfidUid(student.getRfidUid());
                if (existing != null) {
                    return ResponseEntity.badRequest().body(
                        Map.of("message", "A student with RFID UID '" + student.getRfidUid() + "' already exists. Please use a unique RFID."));
                }
            }
            Student saved = studentService.addStudent(student);
            // Auto-create a User login account for this student
            if (student.getEmail() != null && !student.getEmail().isBlank()
                    && student.getPassword() != null && !student.getPassword().isBlank()) {
                try {
                    if (userRepository.findByEmail(student.getEmail()).isEmpty()) {
                        String username = student.getRollNo() != null && !student.getRollNo().isBlank()
                                ? student.getRollNo() : student.getEmail();
                        User user = new User(username, student.getEmail(), student.getPassword(), "STUDENT");
                        userRepository.save(user);
                    }
                } catch (Exception ignored) {
                    // User may already exist — skip silently
                }
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("duplicate key")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Duplicate RFID UID or Roll No. Please use unique values."));
            }
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to add student: " + msg));
        }
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudent(@PathVariable String id) {
        return studentService.getStudentById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody Student updatedStudent) {
        Optional<Student> existing = studentRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student = existing.get();
        student.setName(updatedStudent.getName());
        student.setRollNo(updatedStudent.getRollNo());
        student.setRfidUid(updatedStudent.getRfidUid());
        student.setBranch(updatedStudent.getBranch());
        student.setYear(updatedStudent.getYear());
        student.setEmail(updatedStudent.getEmail());
        student.setJoiningYear(updatedStudent.getJoiningYear());
        student.setPassingYear(updatedStudent.getPassingYear());
        student.setSectionId(updatedStudent.getSectionId());
        student.setSectionName(updatedStudent.getSectionName());
        if (updatedStudent.getPassword() != null && !updatedStudent.getPassword().isBlank()) {
            student.setPassword(updatedStudent.getPassword());
            // Also update the User account password if it exists
            try {
                userRepository.findByEmail(student.getEmail()).ifPresent(u -> {
                    u.setPassword(updatedStudent.getPassword());
                    userRepository.save(u);
                });
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Also remove their User login account
        studentRepository.findById(id).ifPresent(s -> {
            if (s.getEmail() != null) {
                userRepository.findByEmail(s.getEmail()).ifPresent(userRepository::delete);
            }
        });
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
