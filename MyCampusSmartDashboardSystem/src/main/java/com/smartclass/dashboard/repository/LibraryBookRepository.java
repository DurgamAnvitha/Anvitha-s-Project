package com.smartclass.dashboard.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartclass.dashboard.entity.LibraryBook;

public interface LibraryBookRepository extends MongoRepository<LibraryBook, String> {
}
