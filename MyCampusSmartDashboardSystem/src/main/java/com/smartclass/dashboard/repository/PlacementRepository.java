package com.smartclass.dashboard.repository;
import com.smartclass.dashboard.entity.Placement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementRepository extends MongoRepository<Placement, String> {
}
