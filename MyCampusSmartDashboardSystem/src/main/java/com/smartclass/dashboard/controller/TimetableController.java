package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Timetable;
import com.smartclass.dashboard.repository.TimetableRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableRepository timetableRepository;

    public TimetableController(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }

    @GetMapping
    public List<Timetable> getAllTimetable() {
        return timetableRepository.findAll();
    }

    @PostMapping
    public Timetable addTimetable(@RequestBody Timetable timetable) {
        return timetableRepository.save(timetable);
    }

    @PutMapping("/{id}")
    public Timetable updateTimetable(@PathVariable String id, @RequestBody Timetable updatedTimetable) {
        return timetableRepository.findById(id).map(existing -> {
            if (updatedTimetable.getDay() != null) existing.setDay(updatedTimetable.getDay());
            if (updatedTimetable.getTime() != null) existing.setTime(updatedTimetable.getTime());
            if (updatedTimetable.getSubject() != null) existing.setSubject(updatedTimetable.getSubject());
            if (updatedTimetable.getInstructor() != null) existing.setInstructor(updatedTimetable.getInstructor());
            if (updatedTimetable.getRoom() != null) existing.setRoom(updatedTimetable.getRoom());
            if (updatedTimetable.getType() != null) existing.setType(updatedTimetable.getType());
            if (updatedTimetable.getSection() != null) existing.setSection(updatedTimetable.getSection());
            if (updatedTimetable.getSectionId() != null) existing.setSectionId(updatedTimetable.getSectionId());
            if (updatedTimetable.getTeacherId() != null) existing.setTeacherId(updatedTimetable.getTeacherId());
            return timetableRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Timetable slot not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTimetable(@PathVariable String id) {
        timetableRepository.deleteById(id);
    }

    @GetMapping("/day/{day}")
    public List<Timetable> getTimetableByDay(@PathVariable String day) {
        return timetableRepository.findByDay(day);
    }

    @GetMapping("/section/{sectionId}")
    public List<Timetable> getTimetableBySection(@PathVariable String sectionId) {
        return timetableRepository.findBySectionId(sectionId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Timetable> getTimetableByTeacher(@PathVariable String teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }
}
