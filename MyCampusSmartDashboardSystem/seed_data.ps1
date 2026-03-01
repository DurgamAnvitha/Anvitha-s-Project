# Smart Seed Script — Idempotent: won't create duplicates
# Run this anytime to ensure data exists in the database

$BASE_URL = "http://localhost:8080/api"

function Check-AndPost($url, $checkField, $checkValue, $body, $label) {
    try {
        $existing = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        $found = $existing | Where-Object { $_.$checkField -eq $checkValue }
        if ($found) {
            Write-Host "  ✓ $label already exists. Skipping." -ForegroundColor Yellow
        } else {
            $bodyJson = $body | ConvertTo-Json
            Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $bodyJson | Out-Null
            Write-Host "  + $label created." -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Failed to process $label : $_" -ForegroundColor Red
    }
}

Write-Host "=== Smart Campus - Data Seeder ===" -ForegroundColor Cyan
Write-Host ""

# ─── Sections ───────────────────────────────────────────────
Write-Host "[1/4] Seeding Sections..." -ForegroundColor Cyan
$sections = @(
    @{ name="CSE-A"; branch="CSE"; year="4"; semester="7"; academicYear="2025-26"; classRoom="A-101"; maxCapacity=60 },
    @{ name="CSE-B"; branch="CSE"; year="4"; semester="7"; academicYear="2025-26"; classRoom="A-102"; maxCapacity=60 },
    @{ name="ECE-A"; branch="ECE"; year="3"; semester="5"; academicYear="2025-26"; classRoom="B-201"; maxCapacity=60 },
    @{ name="ME-A";  branch="ME";  year="2"; semester="3"; academicYear="2025-26"; classRoom="C-301"; maxCapacity=60 }
)
foreach ($s in $sections) {
    Check-AndPost "$BASE_URL/sections" "name" $s.name $s "Section $($s.name)"
}

# ─── Teachers ───────────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Seeding Teachers..." -ForegroundColor Cyan
$teachers = @(
    @{ name="Dr. Isaac Clarke";   employeeId="T001"; email="isaac@avanthi.edu";  department="CSE"; designation="Professor";           joiningDate="2020-01-15"; qualification="Ph.D in Computer Science"; password="123456" },
    @{ name="Dr. Sarah Connor";   employeeId="T002"; email="sarah@avanthi.edu";  department="ECE"; designation="Assistant Professor";  joiningDate="2021-08-20"; qualification="M.Tech in Electronics";    password="password123" },
    @{ name="Dr. Gordon Freeman"; employeeId="T003"; email="gordon@avanthi.edu"; department="ME";  designation="Senior Professor";     joiningDate="1998-05-10"; qualification="Ph.D in Physics";          password="password123" }
)
foreach ($t in $teachers) {
    Check-AndPost "$BASE_URL/teachers" "email" $t.email $t "Teacher $($t.name)"
}

# ─── Students ───────────────────────────────────────────────
Write-Host ""
Write-Host "[3/4] Seeding Students..." -ForegroundColor Cyan
$students = @(
    @{ name="Lara Croft";     rollNo="S002"; rfidUid="RFID002"; branch="CSE"; year=4; email="lara@avanthi.edu";    sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.8; password="123456" },
    @{ name="Nathan Drake";   rollNo="S003"; rfidUid="RFID003"; branch="CSE"; year=4; email="nathan@avanthi.edu";  sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.2; password="password123" },
    @{ name="Aloy Sobeck";    rollNo="S004"; rfidUid="RFID004"; branch="CSE"; year=4; email="aloy@avanthi.edu";    sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.5; password="password123" },
    @{ name="Joel Miller";    rollNo="S005"; rfidUid="RFID005"; branch="CSE"; year=4; email="joel@avanthi.edu";    sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=8.8; password="password123" },
    @{ name="Ellie Williams"; rollNo="S006"; rfidUid="RFID006"; branch="CSE"; year=4; email="ellie@avanthi.edu";   sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=9.7; password="password123" },
    @{ name="Kratos Spartan"; rollNo="S007"; rfidUid="RFID007"; branch="CSE"; year=4; email="kratos@avanthi.edu";  sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.5; password="password123" },
    @{ name="Arthur Morgan";  rollNo="S008"; rfidUid="RFID008"; branch="CSE"; year=4; email="arthur@avanthi.edu";  sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.2; password="password123" },
    @{ name="John Marston";   rollNo="S009"; rfidUid="RFID009"; branch="CSE"; year=4; email="john@avanthi.edu";    sectionName="CSE-B"; joiningYear=2022; passingYear=2026; cgpa=8.0; password="password123" },
    @{ name="Master Chief";   rollNo="S010"; rfidUid="RFID010"; branch="ECE"; year=3; email="chief@avanthi.edu";   sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=9.4; password="password123" },
    @{ name="Geralt Rivia";   rollNo="S011"; rfidUid="RFID011"; branch="ME";  year=2; email="geralt@avanthi.edu";  sectionName="ME-A";  joiningYear=2024; passingYear=2028; cgpa=8.9; password="password123" },
    @{ name="Ada Lovelace";   rollNo="S012"; rfidUid="RFID012"; branch="CSE"; year=4; email="ada@avanthi.edu";     sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.9; password="password123" },
    @{ name="Isaac Newton";   rollNo="S013"; rfidUid="RFID013"; branch="CSE"; year=4; email="inewton@avanthi.edu"; sectionName="CSE-A"; joiningYear=2022; passingYear=2026; cgpa=9.6; password="password123" },
    @{ name="Alan Turing";    rollNo="S014"; rfidUid="RFID014"; branch="ECE"; year=3; email="turing@avanthi.edu";  sectionName="ECE-A"; joiningYear=2023; passingYear=2027; cgpa=9.3; password="password123" },
    @{ name="Marie Curie";    rollNo="S015"; rfidUid="RFID015"; branch="ME";  year=2; email="mcurie@avanthi.edu";  sectionName="ME-A";  joiningYear=2024; passingYear=2028; cgpa=8.7; password="password123" }
)
foreach ($st in $students) {
    Check-AndPost "$BASE_URL/students" "rfidUid" $st.rfidUid $st "Student $($st.name)"
}

# ─── Summary ────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Verifying counts..." -ForegroundColor Cyan
$sCount = (Invoke-RestMethod "$BASE_URL/sections").Count
$tCount = (Invoke-RestMethod "$BASE_URL/teachers").Count
$stCount = (Invoke-RestMethod "$BASE_URL/students").Count
Write-Host ""
Write-Host "=== Database Status ===" -ForegroundColor Cyan
Write-Host "  Sections : $sCount" -ForegroundColor Green
Write-Host "  Teachers : $tCount" -ForegroundColor Green
Write-Host "  Students : $stCount" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Seed complete! Your campus data is ready." -ForegroundColor Green
