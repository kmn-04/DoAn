# Test File Upload with Authentication
$baseUrl = "http://localhost:8080"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FILE UPLOAD TEST WITH AUTH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Login to get JWT token
Write-Host "`n[1] Login as admin..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@travelbooking.vn"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    
    if ($token) {
        Write-Host "Success! Logged in as: $($loginData.data.user.name)" -ForegroundColor Green
    } else {
        Write-Host "Error: No token in response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a test image file
Write-Host "`n[2] Creating test image file..." -ForegroundColor Yellow

$testFilePath = "$PSScriptRoot\test-image.txt"
"This is a test file for upload testing. It simulates an image file." | Out-File -FilePath $testFilePath -Encoding UTF8

Write-Host "Test file created: $testFilePath" -ForegroundColor Green

# Step 3: Test upload single file
Write-Host "`n[3] Testing single file upload..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Note: PowerShell multipart form-data upload
    $fileBin = [System.IO.File]::ReadAllBytes($testFilePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test-image.jpg`"",
        "Content-Type: image/jpeg$LF",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBin),
        "--$boundary--$LF"
    ) -join $LF
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/upload/image" -Method POST `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        } `
        -Body $bodyLines `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  File name: $($data.data.fileName)" -ForegroundColor White
    Write-Host "  File URL: $($data.data.fileUrl)" -ForegroundColor White
    
} catch {
    $errorMessage = $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Upload failed: $errorBody" -ForegroundColor Red
    } else {
        Write-Host "Upload failed: $errorMessage" -ForegroundColor Red
    }
}

# Step 4: Test list files
Write-Host "`n[4] Testing list uploaded files..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/files/list" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.data) {
        Write-Host "Success! Found $($data.data.Count) files" -ForegroundColor Green
        $data.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $_" -ForegroundColor White
        }
    } else {
        Write-Host "No files found" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test file info endpoint
Write-Host "`n[5] Testing get file info..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/files/info" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Success! Storage info retrieved" -ForegroundColor Green
    Write-Host "  Upload directory: $($data.data.uploadDir)" -ForegroundColor White
    Write-Host "  Max file size: $($data.data.maxFileSize)" -ForegroundColor White
    
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Remove-Item -Path $testFilePath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

