package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Submission;
import com.smartclass.dashboard.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepository;

    @GetMapping
    public List<Submission> getAll() {
        return submissionRepository.findAll();
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<Submission> getByAssignment(@PathVariable String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    @GetMapping("/student/{studentId}")
    public List<Submission> getByStudent(@PathVariable String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Submission submit(@RequestBody Submission submission) {
        submission.setStatus("SUBMITTED");
        return submissionRepository.save(submission);
    }

    @PutMapping("/{id}/grade")
    public Submission grade(@PathVariable String id, @RequestBody Submission gradingData) {
        Submission sub = submissionRepository.findById(id).orElseThrow();
        sub.setMarks(gradingData.getMarks());
        sub.setFeedback(gradingData.getFeedback());
        sub.setStatus("GRADED");
        return submissionRepository.save(sub);
    }
}
