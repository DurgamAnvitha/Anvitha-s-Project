package com.smartclass.dashboard.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartclass.dashboard.entity.LibraryIssue;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryIssueRepository extends MongoRepository<LibraryIssue, String> {
    java.util.List<LibraryIssue> findByStudentId(String studentId);
    java.util.List<LibraryIssue> findByStudentIdAndStatus(String studentId, String status);
    long countByStudentIdAndStatus(String studentId, String status);
}
