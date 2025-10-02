# Backend API Testing Script
# Created: 2025-10-02
# Purpose: Test all backend endpoints

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🧪 BACKEND API TESTING SUITE" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080"
$passed = 0
$failed = 0

# Test 1: Health Check
Write-Host "📍 Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method GET -TimeoutSec 5
    Write-Host "✅ PASSED - API Docs accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Swagger UI
Write-Host "`n📍 Test 2: Swagger UI" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/swagger-ui.html" -Method GET -TimeoutSec 5
    Write-Host "✅ PASSED - Swagger UI accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   🔗 URL: $baseUrl/swagger-ui.html" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Categories API
Write-Host "`n📍 Test 3: Categories API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method GET
    Write-Host "✅ PASSED - Retrieved $($response.data.Count) categories" -ForegroundColor Green
    $response.data | Select-Object -First 3 | ForEach-Object {
        Write-Host "   • $($_.name)" -ForegroundColor Cyan
    }
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Tours API
Write-Host "`n📍 Test 4: Tours API (Pagination)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/tours?page=0`&size=5" -Method GET
    Write-Host "✅ PASSED - Total tours: $($response.data.totalElements)" -ForegroundColor Green
    $response.data.content | Select-Object -First 2 | ForEach-Object {
        Write-Host "   • $($_.name) - $($_.price) VND" -ForegroundColor Cyan
    }
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Payment Methods
Write-Host "`n📍 Test 5: Payment Methods" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/payment/methods" -Method GET
    Write-Host "✅ PASSED - Payment methods retrieved" -ForegroundColor Green
    $response.data | ForEach-Object {
        $status = if($_.enabled) { "ENABLED" } else { "DISABLED" }
        $color = if($_.enabled) { "Green" } else { "Red" }
        Write-Host "   • $($_.name): $status" -ForegroundColor $color
    }
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Countries API
Write-Host "`n📍 Test 6: Countries API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/countries" -Method GET
    Write-Host "✅ PASSED - Retrieved $($response.data.Count) countries" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Promotions API
Write-Host "`n📍 Test 7: Promotions API" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/promotions?page=0`&size=5" -Method GET
    Write-Host "✅ PASSED - Promotions API working" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Admin endpoints (should require auth)
Write-Host "`n📍 Test 8: Admin Tours API (Auth Required)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/tours" -Method GET -ErrorAction Stop
    Write-Host "⚠️  WARNING - Admin endpoint accessible without auth" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASSED - Correctly requires authentication [403 Forbidden]" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAILED - Wrong status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}

# Test 9: File Upload API (should require auth)
Write-Host "`n📍 Test 9: File Upload API (Auth Required)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/upload/image" -Method POST -ErrorAction Stop
    Write-Host "⚠️  WARNING - Upload endpoint accessible without auth" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASSED - Correctly requires authentication [403 Forbidden]" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAILED - Wrong status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}

# Test 10: Count endpoints
Write-Host "`n📍 Test 10: Endpoint Count" -ForegroundColor Yellow
try {
    $apiDocs = Invoke-RestMethod -Uri "$baseUrl/api-docs" -Method GET
    $endpointCount = ($apiDocs.paths.PSObject.Properties | Measure-Object).Count
    Write-Host "✅ PASSED - Total endpoints: $endpointCount" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$total = $passed + $failed
$percentage = if($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
Write-Host "📈 Success Rate: $percentage%" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "   • Swagger UI: $baseUrl/swagger-ui.html" -ForegroundColor White
Write-Host "   • API Docs: $baseUrl/api-docs" -ForegroundColor White
Write-Host ""

