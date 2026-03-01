package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Student findByRfidUid(String rfidUid);
    java.util.Optional<Student> findByEmail(String email);
    java.util.Optional<Student> findByRollNo(String rollNo);
}
