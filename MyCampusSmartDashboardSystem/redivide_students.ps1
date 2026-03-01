$sections = @(
    @{ name="CSE-A"; branch="CSE"; year=4; academicYear="2025-26"; classRoom="A-101"; maxCapacity=60 },
    @{ name="CSE-B"; branch="CSE"; year=4; academicYear="2025-26"; classRoom="A-102"; maxCapacity=60 },
    @{ name="ECE-A"; branch="ECE"; year=3; academicYear="2025-26"; classRoom="B-201"; maxCapacity=60 },
    @{ name="ECE-B"; branch="ECE"; year=3; academicYear="2025-26"; classRoom="B-202"; maxCapacity=60 }
)

$students = @(
    # CSE-A
    @{ name="Lara Croft"; rollNo="S002"; rfidUid="RFID002"; branch="CSE"; year=4; email="lara@avanthi.edu"; sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.8 },
    @{ name="Nathan Drake"; rollNo="S003"; rfidUid="RFID003"; branch="CSE"; year=4; email="nathan@avanthi.edu"; sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.2 },
    @{ name="Aloy Sobeck"; rollNo="S004"; rfidUid="001"; branch="CSE"; year=4; email="aloy@avanthi.edu"; sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.5 },
    @{ name="Joel Miller"; rollNo="S005"; rfidUid="RFID005"; branch="CSE"; year=4; email="joel@avanthi.edu"; sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=8.8 },
    
    # CSE-B
    @{ name="Ellie Williams"; rollNo="S006"; rfidUid="RFID006"; branch="CSE"; year=4; email="ellie@avanthi.edu"; sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=9.7 },
    @{ name="Kratos Spartan"; rollNo="S007"; rfidUid="RFID007"; branch="CSE"; year=4; email="kratos@avanthi.edu"; sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.5 },
    @{ name="Arthur Morgan"; rollNo="S008"; rfidUid="RFID008"; branch="CSE"; year=4; email="arthur@avanthi.edu"; sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.2 },
    @{ name="John Marston"; rollNo="S009"; rfidUid="RFID009"; branch="CSE"; year=4; email="john@avanthi.edu"; sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.0 },

    # ECE-A
    @{ name="Master Chief"; rollNo="S010"; rfidUid="RFID010"; branch="ECE"; year=3; email="chief@avanthi.edu"; sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=9.4 },
    @{ name="Samus Aran"; rollNo="S011"; rfidUid="RFID011"; branch="ECE"; year=3; email="samus@avanthi.edu"; sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=9.6 },
    @{ name="Solid Snake"; rollNo="S012"; rfidUid="RFID012"; branch="ECE"; year=3; email="snake@avanthi.edu"; sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=8.7 },
    @{ name="Leon Kennedy"; rollNo="S013"; rfidUid="RFID013"; branch="ECE"; year=3; email="leon@avanthi.edu"; sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=8.4 },

    # ECE-B
    @{ name="Jill Valentine"; rollNo="S014"; rfidUid="RFID014"; branch="ECE"; year=3; email="jill@avanthi.edu"; sectionName="ECE-B"; joiningYear=2023; passingYear=2027; cgpa=9.1 },
    @{ name="Claire Redfield"; rollNo="S015"; rfidUid="RFID015"; branch="ECE"; year=3; email="claire@avanthi.edu"; sectionName="ECE-B"; joiningYear=2023; passingYear=2027; cgpa=8.9 },
    @{ name="Chris Redfield"; rollNo="S016"; rfidUid="RFID016"; branch="ECE"; year=3; email="chris@avanthi.edu"; sectionName="ECE-B"; joiningYear=2023; passingYear=2027; cgpa=8.3 },
    @{ name="Peter Parker"; rollNo="S017"; rfidUid="RFID017"; branch="ECE"; year=3; email="peter@avanthi.edu"; sectionName="ECE-B"; joiningYear=2023; passingYear=2027; cgpa=9.0 }
)

# Clear existing data
Write-Host "Cleaning database..."
Invoke-RestMethod -Method Delete -Uri "http://localhost:8080/api/admin/clear-all"

# Seed Sections
Write-Host "Seeding Sections..."
foreach ($sec in $sections) {
    Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/sections" -Body ($sec | ConvertTo-Json) -ContentType "application/json"
}

# Seed Students
Write-Host "Seeding 16 Students divided over 4 sections..."
foreach ($std in $students) {
    # Set default password
    $std.password = "password123"
    Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/students" -Body ($std | ConvertTo-Json) -ContentType "application/json"
}

Write-Host "Database sync complete. 16 Students / 4 Sections / All CGPAs Live."
