package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "assignments")
public class Assignment {
    @Id
    private String id;
    private String title;
    private String description;
    private String deadline; // ISO Date String
    private int maxMarks;
    private String sectionId;
    private String teacherId;
    private String subject;
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public int getMaxMarks() { return maxMarks; }
    public void setMaxMarks(int maxMarks) { this.maxMarks = maxMarks; }
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
