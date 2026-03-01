package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Assignment;
import com.smartclass.dashboard.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @GetMapping
    public List<Assignment> getAll() {
        return assignmentRepository.findAll();
    }

    @GetMapping("/section/{sectionId}")
    public List<Assignment> getBySection(@PathVariable String sectionId) {
        return assignmentRepository.findBySectionId(sectionId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Assignment> getByTeacher(@PathVariable String teacherId) {
        return assignmentRepository.findByTeacherId(teacherId);
    }

    @PostMapping
    public Assignment create(@RequestBody Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        assignmentRepository.deleteById(id);
    }
}
