package com.smartclass.dashboard.entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "placements")
public class Placement {
    @Id
    private String id;
    private String companyName;
    private double ctc;
    private int totalStudents;
    private LocalDate updateDate;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public double getCtc() { return ctc; }
    public void setCtc(double ctc) { this.ctc = ctc; }
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public LocalDate getUpdateDate() { return updateDate; }
    public void setUpdateDate(LocalDate updateDate) { this.updateDate = updateDate; }
}
