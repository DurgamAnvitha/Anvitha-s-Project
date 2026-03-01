package com.smartclass.dashboard.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "timetable")
public class Timetable {

    @Id
    private String id;

    private String day;
    private String time;
    private String subject;
    private String instructor;
    private String room;
    private String type;
    private String section;
    private String sectionId;
    private String teacherId;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
}
