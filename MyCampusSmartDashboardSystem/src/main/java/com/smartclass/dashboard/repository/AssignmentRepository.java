package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findBySectionId(String sectionId);
    List<Assignment> findByTeacherId(String teacherId);
}
