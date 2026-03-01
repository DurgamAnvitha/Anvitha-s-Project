package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.ResourceMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResourceMaterialRepository extends MongoRepository<ResourceMaterial, String> {
    List<ResourceMaterial> findBySectionId(String sectionId);
    List<ResourceMaterial> findByTeacherId(String teacherId);
}
