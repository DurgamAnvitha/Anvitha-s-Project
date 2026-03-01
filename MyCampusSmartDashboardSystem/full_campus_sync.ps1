# Avanthi Campus Sync Script
# 16 Students | 4 Sections | 5 Teachers | CGPAs | Assignments

Write-Host "--- Starting Avanthi Campus Intelligence Sync ---" -ForegroundColor Cyan

# 1. Clear Data
Write-Host "[1/5] Cleaning Stream..."
Invoke-RestMethod -Method Delete -Uri "http://localhost:8080/api/admin/clear-all"

# 2. Seed Teachers
Write-Host "[2/5] Seeding Faculty..."
$faculty = @(
    @{ name="Dr. Sarah Connor"; email="sarah@avanthi.edu"; department="CSE"; designation="Professor"; qualification="Ph.D in AI" },
    @{ name="Prof. Charles Xavier"; email="charles@avanthi.edu"; department="ECE"; designation="Professor"; qualification="Ph.D in Telecomm" },
    @{ name="Dr. Bruce Banner"; email="bruce@avanthi.edu"; department="CSE"; designation="Associate Professor"; qualification="Ph.D in Data Science" },
    @{ name="Prof. Erik Lehnsherr"; email="erik@avanthi.edu"; department="ECE"; designation="Associate Professor"; qualification="Ph.D in Magnetism" },
    @{ name="Dr. Tony Stark"; email="tony@avanthi.edu"; department="ME"; designation="Professor"; qualification="Ph.D in Engineering" }
)
$teacherIds = @()
foreach ($f in $faculty) {
    $f.password = "password123"
    $res = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/teachers" -Body ($f | ConvertTo-Json) -ContentType "application/json"
    $teacherIds += $res.id
}

# 3. Seed Sections
Write-Host "[3/5] Seeding Sections..."
$sections = @(
    @{ name="CSE-A"; branch="CSE"; year=4; academicYear="2025-26"; classRoom="A-101"; maxCapacity=60; classTeacherId=$teacherIds[0] },
    @{ name="CSE-B"; branch="CSE"; year=4; academicYear="2025-26"; classRoom="A-102"; maxCapacity=60; classTeacherId=$teacherIds[2] },
    @{ name="ECE-A"; branch="ECE"; year=3; academicYear="2025-26"; classRoom="B-201"; maxCapacity=60; classTeacherId=$teacherIds[1] },
    @{ name="ECE-B"; branch="ECE"; year=3; academicYear="2025-26"; classRoom="B-202"; maxCapacity=60; classTeacherId=$teacherIds[3] }
)
$sectionIds = @()
foreach ($s in $sections) {
    $res = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/sections" -Body ($s | ConvertTo-Json) -ContentType "application/json"
    $sectionIds += @{ name=$s.name; id=$res.id }
}

# 4. Seed Students
Write-Host "[4/5] Seeding 16 Students..."
$students = @(
    # CSE-A
    @{ name="Lara Croft"; rollNo="S002"; rfidUid="RFID002"; branch="CSE"; year=4; email="lara@avanthi.edu"; sectionName="CSE-A"; sectionId=$sectionIds[0].id; joiningYear=2022; passingYear=2026; cgpa=9.8 },
    @{ name="Nathan Drake"; rollNo="S003"; rfidUid="RFID003"; branch="CSE"; year=4; email="nathan@avanthi.edu"; sectionName="CSE-A"; sectionId=$sectionIds[0].id; joiningYear=2022; passingYear=2026; cgpa=9.2 },
    @{ name="Aloy Sobeck"; rollNo="S004"; rfidUid="001"; branch="CSE"; year=4; email="aloy@avanthi.edu"; sectionName="CSE-A"; sectionId=$sectionIds[0].id; joiningYear=2022; passingYear=2026; cgpa=9.5 },
    @{ name="Joel Miller"; rollNo="S005"; rfidUid="RFID005"; branch="CSE"; year=4; email="joel@avanthi.edu"; sectionName="CSE-A"; sectionId=$sectionIds[0].id; joiningYear=2022; passingYear=2026; cgpa=8.8 },
    
    # CSE-B
    @{ name="Ellie Williams"; rollNo="S006"; rfidUid="RFID006"; branch="CSE"; year=4; email="ellie@avanthi.edu"; sectionName="CSE-B"; sectionId=$sectionIds[1].id; joiningYear=2022; passingYear=2026; cgpa=9.7 },
    @{ name="Kratos Spartan"; rollNo="S007"; rfidUid="RFID007"; branch="CSE"; year=4; email="kratos@avanthi.edu"; sectionName="CSE-B"; sectionId=$sectionIds[1].id; joiningYear=2022; passingYear=2026; cgpa=8.5 },
    @{ name="Arthur Morgan"; rollNo="S008"; rfidUid="RFID008"; branch="CSE"; year=4; email="arthur@avanthi.edu"; sectionName="CSE-B"; sectionId=$sectionIds[1].id; joiningYear=2022; passingYear=2026; cgpa=8.2 },
    @{ name="John Marston"; rollNo="S009"; rfidUid="RFID009"; branch="CSE"; year=4; email="john@avanthi.edu"; sectionName="CSE-B"; sectionId=$sectionIds[1].id; joiningYear=2022; passingYear=2026; cgpa=8.0 },

    # ECE-A
    @{ name="Master Chief"; rollNo="S010"; rfidUid="RFID010"; branch="ECE"; year=3; email="chief@avanthi.edu"; sectionName="ECE-A"; sectionId=$sectionIds[2].id; joiningYear=2023; passingYear=2027; cgpa=9.4 },
    @{ name="Samus Aran"; rollNo="S011"; rfidUid="RFID011"; branch="ECE"; year=3; email="samus@avanthi.edu"; sectionName="ECE-A"; sectionId=$sectionIds[2].id; joiningYear=2023; passingYear=2027; cgpa=9.6 },
    @{ name="Solid Snake"; rollNo="S012"; rfidUid="RFID012"; branch="ECE"; year=3; email="snake@avanthi.edu"; sectionName="ECE-A"; sectionId=$sectionIds[2].id; joiningYear=2023; passingYear=2027; cgpa=8.7 },
    @{ name="Leon Kennedy"; rollNo="S013"; rfidUid="RFID013"; branch="ECE"; year=3; email="leon@avanthi.edu"; sectionName="ECE-A"; sectionId=$sectionIds[2].id; joiningYear=2023; passingYear=2027; cgpa=8.4 },

    # ECE-B
    @{ name="Jill Valentine"; rollNo="S014"; rfidUid="RFID014"; branch="ECE"; year=3; email="jill@avanthi.edu"; sectionName="ECE-B"; sectionId=$sectionIds[3].id; joiningYear=2023; passingYear=2027; cgpa=9.1 },
    @{ name="Claire Redfield"; rollNo="S015"; rfidUid="RFID015"; branch="ECE"; year=3; email="claire@avanthi.edu"; sectionName="ECE-B"; sectionId=$sectionIds[3].id; joiningYear=2023; passingYear=2027; cgpa=8.9 },
    @{ name="Chris Redfield"; rollNo="S016"; rfidUid="RFID016"; branch="ECE"; year=3; email="chris@avanthi.edu"; sectionName="ECE-B"; sectionId=$sectionIds[3].id; joiningYear=2023; passingYear=2027; cgpa=8.3 },
    @{ name="Peter Parker"; rollNo="S017"; rfidUid="RFID017"; branch="ECE"; year=3; email="peter@avanthi.edu"; sectionName="ECE-B"; sectionId=$sectionIds[3].id; joiningYear=2023; passingYear=2027; cgpa=9.0 }
)
foreach ($std in $students) {
    $std.password = "password123"
    Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/students" -Body ($std | ConvertTo-Json) -ContentType "application/json"
}

# 5. Summary
Write-Host "[5/5] Finalizing Telemetry..."
Write-Host "--- Sync Success: 16 Students, 4 Sections, 5 Faculty. All Streams Active. ---" -ForegroundColor Green
