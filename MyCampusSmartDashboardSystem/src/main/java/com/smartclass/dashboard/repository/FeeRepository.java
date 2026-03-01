package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeRepository extends MongoRepository<Fee, String> {
    List<Fee> findByStudentId(String studentId);
}
