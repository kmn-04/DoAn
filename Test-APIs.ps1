# API Testing Script for Spring Boot Backend
# Tests all endpoints and reports errors

$BASE_URL = "http://localhost:8080"
$RESULTS_FILE = "api-test-results.md"

# Colors
$SUCCESS = "Green"
$ERROR = "Red"
$WARNING = "Yellow"

# Statistics
$script:Total = 0
$script:Passed = 0
$script:Failed = 0
$script:Skipped = 0
$script:Errors = @()
$script:Results = @()

function Get-APIDocumentation {
    try {
        Write-Host "`n🔍 Fetching API documentation..." -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "$BASE_URL/api-docs" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            return $response.Content | ConvertFrom-Json
        }
    }
    catch {
        Write-Host "❌ Failed to fetch API docs: $_" -ForegroundColor Red
        return $null
    }
}

function Get-AuthToken {
    Write-Host "`n🔐 Attempting login..." -ForegroundColor Cyan
    
    $loginData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            if ($data.data.token) {
                Write-Host "✅ Login successful" -ForegroundColor Green
                return $data.data.token
            }
        }
    }
    catch {
        Write-Host "⚠️  Login failed: $_" -ForegroundColor Yellow
    }
    
    return $null
}

function Test-Endpoint {
    param(
        [string]$Path,
        [string]$Method,
        [string]$Token,
        [bool]$RequiresAuth = $true
    )
    
    $url = "$BASE_URL$Path"
    $script:Total++
    
    # Skip if requires auth and we don't have token
    if ($RequiresAuth -and -not $Token) {
        $script:Skipped++
        return @{
            Success = $null
            Message = "Skipped (no auth)"
        }
    }
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
            TimeoutSec = 10
        }
        
        if ($Method -in @('POST', 'PUT', 'PATCH')) {
            $params['Body'] = "{}" 
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $status = $response.StatusCode
        
        $script:Passed++
        return @{
            Success = $true
            Message = "OK ($status)"
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        # Expected errors (401, 403, 404, 400 for empty body)
        if ($statusCode -in @(401, 403, 404, 400)) {
            $script:Passed++
            return @{
                Success = $true
                Message = "Expected ($statusCode)"
            }
        }
        
        # Server errors (500+)
        if ($statusCode -ge 500) {
            $script:Failed++
            $errorMsg = "Server Error $statusCode"
            
            try {
                $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json
                if ($errorContent.error) {
                    $errorMsg = "$statusCode`: $($errorContent.error)"
                }
            }
            catch {}
            
            $script:Errors += @{
                Method = $Method
                Path = $Path
                Error = $errorMsg
            }
            
            return @{
                Success = $false
                Message = $errorMsg
            }
        }
        
        # Other client errors
        if ($statusCode -ge 400) {
            $script:Failed++
            $errorMsg = "Client Error $statusCode"
            
            $script:Errors += @{
                Method = $Method
                Path = $Path
                Error = $errorMsg
            }
            
            return @{
                Success = $false
                Message = $errorMsg
            }
        }
        
        # Connection/timeout errors
        $script:Failed++
        $errorMsg = "Exception: $($_.Exception.Message.Substring(0, [Math]::Min(50, $_.Exception.Message.Length)))"
        
        $script:Errors += @{
            Method = $Method
            Path = $Path
            Error = $errorMsg
        }
        
        return @{
            Success = $false
            Message = $errorMsg
        }
    }
}

function Save-Results {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $content = @"
# API Test Results

**Date:** $timestamp

## Summary

- **Total:** $($script:Total)
- **✅ Passed:** $($script:Passed)
- **❌ Failed:** $($script:Failed)
- **⚠️  Skipped:** $($script:Skipped)

"@

    if ($script:Errors.Count -gt 0) {
        $content += "`n## Errors ($($script:Errors.Count))`n`n"
        foreach ($error in $script:Errors) {
            $content += "### ❌ ``$($error.Method) $($error.Path)```n"
            $content += "- **Error:** $($error.Error)`n`n"
        }
    }

    $content += "`n## All Results`n`n"
    $content += "| Status | Method | Endpoint | Result |`n"
    $content += "|--------|--------|----------|--------|`n"
    
    foreach ($result in $script:Results) {
        $icon = if ($result.Success -eq $true) { "✅" } elseif ($result.Success -eq $null) { "⚠️" } else { "❌" }
        $content += "| $icon | ``$($result.Method)`` | ``$($result.Path)`` | $($result.Message) |`n"
    }
    
    $content | Out-File -FilePath $RESULTS_FILE -Encoding UTF8
    Write-Host "`n💾 Results saved to: $RESULTS_FILE" -ForegroundColor Cyan
}

# Main execution
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host " API TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

# Get API documentation
$apiDocs = Get-APIDocumentation

if (-not $apiDocs -or -not $apiDocs.paths) {
    Write-Host "❌ Could not retrieve API paths" -ForegroundColor Red
    exit 1
}

$paths = $apiDocs.paths | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
Write-Host "📋 Found $($paths.Count) endpoints`n" -ForegroundColor Cyan

# Get auth token
$token = Get-AuthToken
Write-Host ""

# Test each endpoint
Write-Host "🧪 Testing endpoints...`n" -ForegroundColor Cyan

foreach ($path in $paths | Sort-Object) {
    $methods = $apiDocs.paths.$path | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    
    foreach ($method in $methods) {
        $requiresAuth = -not ($path -match '/api/auth/' -and $path -match 'login|register|forgot-password')
        
        $result = Test-Endpoint -Path $path -Method $method.ToUpper() -Token $token -RequiresAuth $requiresAuth
        
        $icon = if ($result.Success -eq $true) { 
            "✅" 
        } elseif ($result.Success -eq $null) { 
            "⚠️ " 
        } else { 
            "❌" 
        }
        
        $color = if ($result.Success -eq $true) { 
            $SUCCESS 
        } elseif ($result.Success -eq $null) { 
            $WARNING 
        } else { 
            $ERROR 
        }
        
        $methodStr = $method.ToUpper().PadRight(6)
        $pathStr = $path.PadRight(50)
        
        Write-Host "$icon $methodStr $pathStr → $($result.Message)" -ForegroundColor $color
        
        $script:Results += @{
            Method = $method.ToUpper()
            Path = $path
            Success = $result.Success
            Message = $result.Message
        }
    }
}

# Print summary
Write-Host "`n$('=' * 80)" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "$('=' * 80)" -ForegroundColor Cyan
Write-Host "Total endpoints tested: $($script:Total)"
Write-Host "✅ Passed: $($script:Passed)" -ForegroundColor Green
Write-Host "❌ Failed: $($script:Failed)" -ForegroundColor Red
Write-Host "⚠️  Skipped: $($script:Skipped)" -ForegroundColor Yellow
Write-Host $('=' * 80) -ForegroundColor Cyan
Write-Host ""

# Show errors
if ($script:Errors.Count -gt 0) {
    Write-Host "🚨 ERRORS FOUND ($($script:Errors.Count)):`n" -ForegroundColor Red
    foreach ($error in $script:Errors) {
        Write-Host "  ❌ $($error.Method.PadRight(6)) $($error.Path)" -ForegroundColor Red
        Write-Host "     └─ $($error.Error)`n" -ForegroundColor Red
    }
}

# Save results
Save-Results

Write-Host "`n✨ Testing complete!" -ForegroundColor Green

