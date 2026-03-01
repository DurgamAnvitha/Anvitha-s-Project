package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Attendance;
import com.smartclass.dashboard.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    boolean existsByStudentAndSubjectAndDate(
            Student student,
            String subject,
            LocalDate date
    );

    List<Attendance> findByStudentAndSubject(Student student, String subject);

    long countByStudentAndSubject(Student student, String subject);

    long countByStudentAndSubjectAndStatus(
            Student student,
            String subject,
            char status
    );
    long countByStudent(Student student);
    long countByStudentAndStatus(Student student, char status);
}
