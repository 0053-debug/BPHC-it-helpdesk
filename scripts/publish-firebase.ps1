param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$TunnelUrl
)

$ErrorActionPreference = 'Stop'
$TunnelUrl = $TunnelUrl.Trim().TrimEnd('/')

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Building Frontend pointing to: $TunnelUrl/api" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $projectRoot "frontend")

$env:VITE_API_BASE_URL = "$TunnelUrl/api"
$env:VITE_WS_BASE_URL = $TunnelUrl
npm run build

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host " Deploying to Firebase Hosting..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Set-Location $projectRoot
npx --yes firebase-tools deploy --only hosting --project bphc-it-helpdesk

Write-Host "`n🎉 SUCCESS! Your live dashboard is ready at:" -ForegroundColor Green
Write-Host "👉 https://bphc-it-helpdesk.web.app" -ForegroundColor Yellow
