package com.smartclass.dashboard.service;

import com.smartclass.dashboard.entity.LibraryBook;
import com.smartclass.dashboard.entity.LibraryIssue;

import java.util.List;

public interface LibraryService {

    LibraryBook addBook(LibraryBook book);

    List<LibraryBook> getAllBooks();

    LibraryIssue issueBook(LibraryIssue issue);

    LibraryIssue returnBook(String issueId);

    List<LibraryIssue> getIssuesByStudent(String studentId);

    List<LibraryIssue> getAllIssues();
    
    LibraryBook updateBook(String id, LibraryBook book);
    void deleteBook(String id);
    void deleteIssue(String id);
}
