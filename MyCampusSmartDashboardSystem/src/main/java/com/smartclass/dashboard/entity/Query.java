package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "queries")
public class Query {
    @Id
    private String id;
    private String senderId; // Teacher/Student email or username
    private String senderName;
    private String senderRole; // TEACHER, STUDENT
    private String receiverId = "ADMIN"; // For teacher queries
    private String subject;
    private String content;
    private String status = "PENDING"; // PENDING, RESOLVED
    private String reply;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
