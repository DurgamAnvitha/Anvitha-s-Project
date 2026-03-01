package com.smartclass.dashboard.entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "placement_drives")
public class PlacementDrive {
    @Id
    private String id;
    private String companyName;
    private String venue;
    private String time;
    private LocalDate driveDate;
    private String eligibility;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public LocalDate getDriveDate() { return driveDate; }
    public void setDriveDate(LocalDate driveDate) { this.driveDate = driveDate; }
    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }
}
