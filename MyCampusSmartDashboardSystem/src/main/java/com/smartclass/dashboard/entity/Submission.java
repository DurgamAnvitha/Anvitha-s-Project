package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;
    private String assignmentId;
    private String studentId;
    private String studentName; // For quick dashboard rendering
    private String content; // Submission notes/text
    private String fileLink; // URL to Google Drive / GitHub / etc.
    private int marks;
    private String status = "SUBMITTED"; // SUBMITTED, GRADED
    private String feedback;
    private LocalDateTime submittedAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getFileLink() { return fileLink; }
    public void setFileLink(String fileLink) { this.fileLink = fileLink; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
