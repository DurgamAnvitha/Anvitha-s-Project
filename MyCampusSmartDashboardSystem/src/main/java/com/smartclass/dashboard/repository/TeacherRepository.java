package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface TeacherRepository extends MongoRepository<Teacher, String> {
    Optional<Teacher> findByEmail(String email);
}
