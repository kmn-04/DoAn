# Test Admin APIs
$baseUrl = "http://localhost:8080"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ADMIN APIs TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Test Admin Tours API
Write-Host "`n[1] GET /api/admin/tours (Get all tours)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/tours" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total tours: $($data.data.totalElements)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test Admin Tours - Update Status
Write-Host "`n[2] PATCH /api/admin/tours/1/status (Update tour status)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/tours/1/status?status=Active" -Method PATCH -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Updated tour: $($data.data.name)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test Admin Tours - Toggle Featured
Write-Host "`n[3] PATCH /api/admin/tours/1/featured (Toggle featured status)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/tours/1/featured?featured=true" -Method PATCH -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Featured: $($data.data.isFeatured)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Admin Bookings API
Write-Host "`n[4] GET /api/admin/bookings (Get all bookings)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/bookings" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total bookings: $($data.data.totalElements)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Admin Bookings - Get by Status
Write-Host "`n[5] GET /api/admin/bookings/status/Pending (Get bookings by status)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/bookings/status/Pending" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Pending bookings: $($data.data.totalElements)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test Admin Bookings - Statistics
Write-Host "`n[6] GET /api/admin/bookings/stats (Get booking statistics)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/bookings/stats" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Total bookings: $($data.data.totalBookings)" -ForegroundColor White
    Write-Host "  Confirmed: $($data.data.confirmedCount)" -ForegroundColor White
    Write-Host "  Pending: $($data.data.pendingCount)" -ForegroundColor White
    Write-Host "  Cancelled: $($data.data.cancelledCount)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Test File Upload API
Write-Host "`n[7] GET /api/files/list (List uploaded files)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/files/list" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "  Files found: $($data.data.Count)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

