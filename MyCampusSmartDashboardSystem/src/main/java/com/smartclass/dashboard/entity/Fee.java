package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "fees")
public class Fee {
    @Id
    private String id;
    private String studentId;
    private String feeType; // Tuition, Library, Exam, etc.
    private double amount;
    private double paidAmount;
    private double pendingAmount;
    private LocalDate dueDate;
    private String status; // PENDING, PAID, PARTIAL

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getFeeType() { return feeType; }
    public void setFeeType(String feeType) { this.feeType = feeType; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(double paidAmount) { this.paidAmount = paidAmount; }
    public double getPendingAmount() { return pendingAmount; }
    public void setPendingAmount(double pendingAmount) { this.pendingAmount = pendingAmount; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
