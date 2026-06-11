# .env.local dosyasindaki degiskenleri Vercel production'a yukler
# Kullanim: .\scripts\setup-vercel-env.ps1

$ErrorActionPreference = "Continue"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$EnvFile = Join-Path $RepoRoot ".env.local"
$ConfigFile = Join-Path $PSScriptRoot "push.config.local"

if (Test-Path $ConfigFile) {
    Get-Content $ConfigFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
        }
    }
}

if (-not $env:VERCEL_TOKEN) {
    Write-Host "HATA: VERCEL_TOKEN bulunamadi (push.config.local)" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $EnvFile)) {
    Write-Host "HATA: .env.local bulunamadi." -ForegroundColor Red
    Write-Host "  .env.local.example dosyasini kopyalayip Supabase bilgilerini doldurun." -ForegroundColor Yellow
    exit 1
}

$scopeArgs = @()
if ($env:VERCEL_SCOPE) { $scopeArgs = @("--scope", $env:VERCEL_SCOPE) }

$required = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SESSION_SECRET"
)

$vars = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
        $vars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

foreach ($name in $required) {
    if (-not $vars[$name]) {
        Write-Host "HATA: .env.local icinde $name eksik" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Vercel environment variables yukleniyor..." -ForegroundColor Cyan

foreach ($name in $required) {
    $value = $vars[$name]
    Write-Host "  -> $name" -ForegroundColor Gray

    # Mevcut varsa atla (vercel env add tekrar ekler)
    $value | npx vercel env add $name production --token $env:VERCEL_TOKEN @scopeArgs --force 2>&1 | ForEach-Object {
        if ($_ -notmatch "already exists") { Write-Host $_ }
    }
}

Write-Host ""
Write-Host "Tamamlandi. Simdi deploy edin: .\push.ps1" -ForegroundColor Green
