# PowerShell script to trigger booking completion
# Run this after logging in as admin

Write-Host "🔧 Triggering Booking Completion Job..." -ForegroundColor Yellow
Write-Host ""

# You need to:
# 1. Login as admin in browser
# 2. Open DevTools (F12) → Console
# 3. Run: localStorage.getItem('token')
# 4. Copy the token and paste below

$token = Read-Host "Enter your ADMIN JWT token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ No token provided. Exiting..." -ForegroundColor Red
    exit 1
}

$url = "http://localhost:8080/api/bookings/completion/trigger"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "📡 Sending request to: $url" -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers
    
    Write-Host ""
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "📊 Completed bookings: $($response.data.completedCount)" -ForegroundColor Green
    Write-Host "💬 Message: $($response.data.message)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Now refresh your tour detail page to see 'Viết đánh giá' button!" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "  - Make sure backend is running (http://localhost:8080)" -ForegroundColor White
    Write-Host "  - Make sure you're logged in as ADMIN" -ForegroundColor White
    Write-Host "  - Token might be expired, try logging in again" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"

