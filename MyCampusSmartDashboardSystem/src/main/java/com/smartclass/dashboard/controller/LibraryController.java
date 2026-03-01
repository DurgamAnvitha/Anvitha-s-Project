package com.smartclass.dashboard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.smartclass.dashboard.entity.LibraryBook;
import com.smartclass.dashboard.entity.LibraryIssue;
import com.smartclass.dashboard.service.LibraryService;

import java.util.List;

@RestController
@RequestMapping("/api/library")

public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    // Add new book
    @PostMapping("/books")
    public LibraryBook addBook(@RequestBody LibraryBook book) {
        return libraryService.addBook(book);
    }

    // Get all books
    @GetMapping("/books")
    public List<LibraryBook> getAllBooks() {
        return libraryService.getAllBooks();
    }

    // Issue book to student
    @PostMapping("/issue")
    public LibraryIssue issueBook(@RequestBody LibraryIssue issue) {
        return libraryService.issueBook(issue);
    }

    // Return book
    @PostMapping("/return/{issueId}")
    public LibraryIssue returnBook(@PathVariable String issueId) {
        return libraryService.returnBook(issueId);
    }

    @GetMapping("/issues/student/{studentId}")
    public List<LibraryIssue> getIssuesByStudent(@PathVariable String studentId) {
        return libraryService.getIssuesByStudent(studentId);
    }

    @GetMapping("/issues")
    public List<LibraryIssue> getAllIssues() {
        return libraryService.getAllIssues();
    }

    @PutMapping("/books/{id}")
    public LibraryBook updateBook(@PathVariable String id, @RequestBody LibraryBook book) {
        return libraryService.updateBook(id, book);
    }

    @DeleteMapping("/books/{id}")
    public void deleteBook(@PathVariable String id) {
        libraryService.deleteBook(id);
    }

    @DeleteMapping("/issues/{id}")
    public void deleteIssue(@PathVariable String id) {
        libraryService.deleteIssue(id);
    }
}
