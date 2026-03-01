package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sections")
public class Section {
    @Id
    private String id;
    private String name;
    private String branch;
    private String year;
    private String semester;
    private String academicYear;
    private String classRoom;
    private int maxCapacity;
    private String classTeacherId;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getClassRoom() { return classRoom; }
    public void setClassRoom(String classRoom) { this.classRoom = classRoom; }
    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
    public String getClassTeacherId() { return classTeacherId; }
    public void setClassTeacherId(String classTeacherId) { this.classTeacherId = classTeacherId; }
}
