package com.smartclass.dashboard.service;

import com.smartclass.dashboard.entity.Student;
import java.util.List;

public interface StudentService {

    Student addStudent(Student student);

    List<Student> getAllStudents();

    Student getStudentById(String id);
}
