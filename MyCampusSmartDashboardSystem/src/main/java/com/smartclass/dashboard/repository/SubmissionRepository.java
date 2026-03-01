package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByAssignmentId(String assignmentId);
    List<Submission> findByStudentId(String studentId);
    long countByStudentId(String studentId);
}
