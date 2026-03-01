package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "students")
public class Student {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("rfid_uid")
    private String rfidUid;

    @Field("roll_no")
    private String rollNo;

    private String name;
    private String branch;
    private int year;
    private String email;
    private String password;
    private int joiningYear;
    private int passingYear;
    private String sectionId;
    private String sectionName;
    private double cgpa;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRfidUid() { return rfidUid; }
    public void setRfidUid(String rfidUid) { this.rfidUid = rfidUid; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getJoiningYear() { return joiningYear; }
    public void setJoiningYear(int joiningYear) { this.joiningYear = joiningYear; }

    public int getPassingYear() { return passingYear; }
    public void setPassingYear(int passingYear) { this.passingYear = passingYear; }

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }
}
