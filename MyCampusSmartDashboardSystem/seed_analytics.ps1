# Fetch all students to get their IDs and RFIDs
$students = Invoke-RestMethod -Uri "http://localhost:8080/api/students" -Method Get

# Add some grades for students
# Subjects: ADS, DBMS, OS, AI, CN
$subjects = @("ADS", "DBMS", "OS", "AI", "CN")
$grades = @("A", "B", "C", "D")

foreach ($s in $students) {
    if ($s.rfidUid) {
        # Add 3 grades for each student
        for ($i=0; $i -lt 3; $i++) {
            $grade = @{
                subject = $subjects[$i]
                grade = $grades[(Get-Random -Maximum 4)]
                credits = 3
                semester = 7
            }
            $body = $grade | ConvertTo-Json
            Invoke-RestMethod -Uri "http://localhost:8080/api/grades?rfidUid=$($s.rfidUid)" -Method Post -ContentType "application/json" -Body $body
        }

        # Add some attendance (Present 80% of the time)
        for ($d=0; $d -lt 5; $d++) {
            $status = if ((Get-Random -Maximum 10) -lt 8) { "P" } else { "A" }
            Invoke-RestMethod -Uri "http://localhost:8080/api/attendance?rfidUid=$($s.rfidUid)&subject=ADS&status=$status" -Method Post -ContentType "application/json"
        }
    }
}
