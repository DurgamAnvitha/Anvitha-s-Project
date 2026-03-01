package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "resources")
public class ResourceMaterial {
    @Id
    private String id;
    private String title;
    private String description;
    private String sectionId;
    private String teacherId;
    private String teacherName;
    private String fileLink; // URL to notes
    private String videoLink; // URL to lectures
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public String getFileLink() { return fileLink; }
    public void setFileLink(String fileLink) { this.fileLink = fileLink; }
    public String getVideoLink() { return videoLink; }
    public void setVideoLink(String videoLink) { this.videoLink = videoLink; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
