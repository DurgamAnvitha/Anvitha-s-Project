package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Grades;
import com.smartclass.dashboard.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradesRepository extends MongoRepository<Grades, String> {

    List<Grades> findByStudent(Student student);
}
