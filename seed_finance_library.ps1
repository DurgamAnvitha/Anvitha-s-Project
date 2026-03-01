# Helper function for JSON POST
function Post-Json {
    param($url, $data)
    Invoke-RestMethod -Uri $url -Method Post -Body ($data | ConvertTo-Json) -ContentType "application/json"
}

# Seed books
Post-Json "http://localhost:8080/api/library/books" @{
    title = "Quantum Mechanics and Complexity"
    author = "Dr. Richard Feynman"
    category = "Physics"
    totalCopies = 5
    availableCopies = 5
}

Post-Json "http://localhost:8080/api/library/books" @{
    title = "Artificial General Intelligence"
    author = "Demis Hassabis"
    category = "CS"
    totalCopies = 3
    availableCopies = 3
}

# Get students
$students = Invoke-RestMethod "http://localhost:8080/api/students"
$nathan = $students | Where-Object { $_.name -like "*Nathan*" } | Select-Object -First 1

if ($nathan) {
    # Seed Fees
    Post-Json "http://localhost:8080/api/fees" @{
        studentId = $nathan.id
        feeType = "Tuition Fee"
        amount = 85000.0
        paidAmount = 50000.0
        pendingAmount = 35000.0
        dueDate = "2026-06-15"
        status = "PARTIAL"
    }

    Post-Json "http://localhost:8080/api/fees" @{
        studentId = $nathan.id
        feeType = "Library Late Fee"
        amount = 450.0
        paidAmount = 0.0
        pendingAmount = 450.0
        dueDate = "2026-03-10"
        status = "PENDING"
    }

    # Seed Issue
    $books = Invoke-RestMethod "http://localhost:8080/api/library/books"
    $book = $books | Select-Object -First 1
    if ($book) {
        Post-Json "http://localhost:8080/api/library/issue" @{
            studentId = $nathan.id
            bookId = $book.bookId
            issueDate = "2026-02-20"
            returnDate = "2026-03-05"
            status = "ISSUED"
        }
    }
}
