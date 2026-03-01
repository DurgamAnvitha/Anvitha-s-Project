# Cloud Sync Script for Avanthi Dashboard
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls, [Net.SecurityProtocolType]::Tls11, [Net.SecurityProtocolType]::Tls12, [Net.SecurityProtocolType]::Tls13

$apiUrl = Read-Host "Enter your Render Backend URL (e.g., https://avanthi-backend.onrender.com/api)"
if ($apiUrl -like "*orender.com*") {
    $apiUrl = $apiUrl.Replace("orender.com", "onrender.com")
    Write-Host "⚠️  Corrected typo: Fixed 'orender.com' to 'onrender.com'" -ForegroundColor Yellow
}
if (-not $apiUrl.EndsWith("/api")) { $apiUrl += "/api" }

Write-Host "`n🚀 Starting Cloud Sync to $apiUrl...`n" -ForegroundColor Cyan

function Post-Json {
    param($endpoint, $file)
    if (Test-Path $file) {
        $json = Get-Content $file -Raw | ConvertFrom-Json
        if ($json -is [Array]) {
            $success = 0; $skipped = 0; $failed = 0
            foreach ($item in $json) {
                try {
                    $body = $item | ConvertTo-Json -Depth 10
                    Invoke-RestMethod -Uri "$apiUrl$endpoint" -Method Post -Body $body -ContentType "application/json" | Out-Null
                    $success++
                } catch {
                    $respBody = ""
                    if ($_.Exception.Response) {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $respBody = $reader.ReadToEnd()
                    }
                    if ($respBody -like "*already exists*") {
                        $skipped++
                    } else {
                        Write-Host "[ERROR] Item in $file failed: $($_.Exception.Message) - $respBody" -ForegroundColor Red
                        $failed++
                    }
                }
            }
            Write-Host "[RESULT] ${file}: $success new, $skipped already existed, $failed failed." -ForegroundColor Gray
        } else {
            try {
                $body = $json | ConvertTo-Json -Depth 10
                Invoke-RestMethod -Uri "$apiUrl$endpoint" -Method Post -Body $body -ContentType "application/json" | Out-Null
                Write-Host "[SUCCESS] Synced object from $file to $endpoint" -ForegroundColor Green
            } catch {
                Write-Host "[ERROR] Failed to sync $file - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# 1. Sync Sections & Students (Base Data)
Post-Json "/sections" "MyCampusSmartDashboardSystem/current_sections.json"
Post-Json "/students" "MyCampusSmartDashboardSystem/current_students.json"

# 2. Sync Teachers
if (Test-Path "MyCampusSmartDashboardSystem/teachers_list.json") {
    Post-Json "/teachers" "MyCampusSmartDashboardSystem/teachers_list.json"
}

# 3. Seed Placements & Library (using existing logic)
Write-Host "`n💎 Seeding Placements and Library Data..." -ForegroundColor Yellow

$placement = @{
    companyName = "WISE FINSERV PVT. LTD."
    ctc = 626000.0
    totalStudents = 12
    updateDate = (Get-Date).ToString("yyyy-MM-dd")
}
Invoke-RestMethod -Uri "$apiUrl/placements" -Method Post -Body ($placement | ConvertTo-Json) -ContentType "application/json"

$drives = @(
    @{ companyName = "TCS Ninja"; venue = "E-Block Auditorum"; time = "10:00 AM"; driveDate = (Get-Date).ToString("yyyy-MM-dd"); eligibility = "CSE/ECE with 7.5 CGPA" },
    @{ companyName = "Infosys"; venue = "Placement Cell"; time = "02:00 PM"; driveDate = (Get-Date).ToString("yyyy-MM-dd"); eligibility = "All Branches" }
)
foreach ($drive in $drives) { Invoke-RestMethod -Uri "$apiUrl/placements/drives" -Method Post -Body ($drive | ConvertTo-Json) -ContentType "application/json" }

Write-Host "`n✅ Cloud Sync Complete! Please refresh your website." -ForegroundColor Green
