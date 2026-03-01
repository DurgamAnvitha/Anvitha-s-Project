package com.smartclass.dashboard.controller;

import com.smartclass.dashboard.entity.ResourceMaterial;
import com.smartclass.dashboard.repository.ResourceMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceMaterialController {

    @Autowired
    private ResourceMaterialRepository resourceMaterialRepository;

    @GetMapping
    public List<ResourceMaterial> getAll() {
        return resourceMaterialRepository.findAll();
    }

    @GetMapping("/section/{sectionId}")
    public List<ResourceMaterial> getBySection(@PathVariable String sectionId) {
        return resourceMaterialRepository.findBySectionId(sectionId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<ResourceMaterial> getByTeacher(@PathVariable String teacherId) {
        return resourceMaterialRepository.findByTeacherId(teacherId);
    }

    @PostMapping
    public ResourceMaterial create(@RequestBody ResourceMaterial material) {
        return resourceMaterialRepository.save(material);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        resourceMaterialRepository.deleteById(id);
    }
}
