package com.smartclass.dashboard.repository;
import com.smartclass.dashboard.entity.PlacementDrive;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlacementDriveRepository extends MongoRepository<PlacementDrive, String> {
}
