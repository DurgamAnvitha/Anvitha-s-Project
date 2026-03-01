package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Section;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionRepository extends MongoRepository<Section, String> {
}
