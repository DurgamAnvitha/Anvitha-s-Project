package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.Section;
import com.smartclass.dashboard.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")

public class SectionController {

    @Autowired
    private SectionRepository sectionRepository;

    @GetMapping
    public List<Section> getAll() {
        return sectionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getById(@PathVariable String id) {
        return sectionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Section create(@RequestBody Section section) {
        return sectionRepository.save(section);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!sectionRepository.existsById(id)) return ResponseEntity.notFound().build();
        sectionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
