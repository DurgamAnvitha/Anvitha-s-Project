package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Teacher;
import com.smartclass.dashboard.entity.User;
import com.smartclass.dashboard.repository.TeacherRepository;
import com.smartclass.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teachers")

public class TeacherController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @PostMapping
    public Teacher createTeacher(@RequestBody Teacher teacher) {
        Teacher saved = teacherRepository.save(teacher);
        // Auto-create a User login account for this teacher
        if (teacher.getEmail() != null && !teacher.getEmail().isBlank()
                && teacher.getPassword() != null && !teacher.getPassword().isBlank()) {
            try {
                if (userRepository.findByEmail(teacher.getEmail()).isEmpty()) {
                    String username = teacher.getEmployeeId() != null && !teacher.getEmployeeId().isBlank()
                            ? teacher.getEmployeeId() : teacher.getEmail();
                    User user = new User(username, teacher.getEmail(), teacher.getPassword(), "TEACHER");
                    userRepository.save(user);
                }
            } catch (Exception ignored) {}
        }
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable String id, @RequestBody Teacher updated) {
        Optional<Teacher> existing = teacherRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        Teacher teacher = existing.get();
        teacher.setName(updated.getName());
        teacher.setEmail(updated.getEmail());
        teacher.setPhone(updated.getPhone());
        teacher.setDepartment(updated.getDepartment());
        teacher.setDesignation(updated.getDesignation());
        teacher.setEmployeeId(updated.getEmployeeId());
        teacher.setJoiningDate(updated.getJoiningDate());
        teacher.setQualification(updated.getQualification());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            teacher.setPassword(updated.getPassword());
            try {
                userRepository.findByEmail(teacher.getEmail()).ifPresent(u -> {
                    u.setPassword(updated.getPassword());
                    userRepository.save(u);
                });
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(teacherRepository.save(teacher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable String id) {
        if (!teacherRepository.existsById(id)) return ResponseEntity.notFound().build();
        // Also remove their User login account
        teacherRepository.findById(id).ifPresent(t -> {
            if (t.getEmail() != null) {
                userRepository.findByEmail(t.getEmail()).ifPresent(userRepository::delete);
            }
        });
        teacherRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
