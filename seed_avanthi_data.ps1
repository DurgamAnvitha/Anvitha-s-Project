$baseUrl = "http://localhost:8080/api"

# Seed Recent Placement
$placement = @{
    companyName = "WISE FINSERV PVT. LTD."
    ctc = 626000.0
    totalStudents = 12
    updateDate = (Get-Date).ToString("yyyy-MM-dd")
}
Invoke-RestMethod -Uri "$baseUrl/placements" -Method Post -Body ($placement | ConvertTo-Json) -ContentType "application/json"

# Seed Placement Drives
$drives = @(
    @{
        companyName = "TCS Ninja"
        venue = "E-Block Auditorum"
        time = "10:00 AM"
        driveDate = (Get-Date).ToString("yyyy-MM-dd")
        eligibility = "CSE/ECE with 7.5 CGPA"
    },
    @{
        companyName = "Infosys"
        venue = "Placement Cell"
        time = "02:00 PM"
        driveDate = (Get-Date).ToString("yyyy-MM-dd")
        eligibility = "All Branches"
    },
    @{
        companyName = "Amazon"
        venue = "Main Hall"
        time = "09:00 AM"
        driveDate = (Get-Date).ToString("yyyy-MM-dd")
        eligibility = "CSE/IT (8.0+ CGPA)"
    }
)

foreach ($drive in $drives) {
    Invoke-RestMethod -Uri "$baseUrl/placements/drives" -Method Post -Body ($drive | ConvertTo-Json) -ContentType "application/json"
}

Write-Host "Avanthi Placement Telemetry Seeded Successfully."
