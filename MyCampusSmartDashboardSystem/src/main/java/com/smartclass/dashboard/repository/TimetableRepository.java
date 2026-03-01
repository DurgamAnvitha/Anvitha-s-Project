package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, String> {
    List<Timetable> findByDay(String day);
    List<Timetable> findBySectionId(String sectionId);
    List<Timetable> findByTeacherId(String teacherId);
}
