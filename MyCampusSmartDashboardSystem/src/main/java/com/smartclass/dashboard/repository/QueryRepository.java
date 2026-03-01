package com.smartclass.dashboard.repository;

import com.smartclass.dashboard.entity.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QueryRepository extends MongoRepository<Query, String> {
    List<Query> findBySenderId(String senderId);
    List<Query> findByReceiverId(String receiverId);
    List<Query> findByStatus(String status);
    long countBySenderId(String senderId);
    long countByStatus(String status);
}
