# Test Admin APIs with Authentication
$baseUrl = "http://localhost:8080"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ADMIN APIs TEST (WITH AUTH)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Login to get JWT token
Write-Host "`n[Step 1] Login as admin..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    
    if ($token) {
        Write-Host "Success! Token received: $($token.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "Error: No token in response" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying to create admin account..." -ForegroundColor Yellow
    
    # Try to register admin (if not exists)
    $registerBody = @{
        name = "Admin User"
        email = "admin@example.com"
        password = "admin123"
        phone = "0123456789"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
        Write-Host "Admin account created. Please run script again." -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "Failed to create admin: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Test Admin Tours API
Write-Host "`n[Step 2] GET /api/admin/tours" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/tours" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total tours: $($data.data.totalElements)" -ForegroundColor White
    Write-Host "  Current page: $($data.data.number + 1)/$($data.data.totalPages)" -ForegroundColor White
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test Admin Bookings API
Write-Host "`n[Step 3] GET /api/admin/bookings" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/bookings" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total bookings: $($data.data.totalElements)" -ForegroundColor White
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Booking Statistics
Write-Host "`n[Step 4] GET /api/admin/bookings/stats" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/bookings/stats" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total: $($data.data.totalBookings)" -ForegroundColor White
    Write-Host "  Confirmed: $($data.data.confirmedCount)" -ForegroundColor White
    Write-Host "  Pending: $($data.data.pendingCount)" -ForegroundColor White
    Write-Host "  Cancelled: $($data.data.cancelledCount)" -ForegroundColor White
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test Promotions API
Write-Host "`n[Step 5] GET /api/admin/promotions" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/promotions" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total promotions: $($data.data.totalElements)" -ForegroundColor White
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Test File Upload List
Write-Host "`n[Step 6] GET /api/files/list" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/files/list" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    if ($data.data) {
        Write-Host "  Files: $($data.data.Count)" -ForegroundColor White
    } else {
        Write-Host "  Files: 0" -ForegroundColor White
    }
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

