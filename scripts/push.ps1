# Taş Kamping Asistanı — GitHub push + Vercel deploy tetikleyici
# Kullanım: .\scripts\push.ps1
#          .\scripts\push.ps1 -Message "feat: yeni özellik"

param(
    [string]$Message = "chore: proje güncellemesi"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$ConfigFile = Join-Path $PSScriptRoot "push.config.local"
if (Test-Path $ConfigFile) {
    Get-Content $ConfigFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $val = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $val
        }
    }
}

$GitEmail = if ($env:GIT_USER_EMAIL) { $env:GIT_USER_EMAIL } else { "seo.okacar@gmail.com" }
$GitName  = if ($env:GIT_USER_NAME)  { $env:GIT_USER_NAME }  else { "motiweb-marketing" }
$Token    = $env:GITHUB_TOKEN
$Remote   = "https://github.com/motiweb-marketing/tas-kamping-asistani.git"
$Branch   = "main"

if (-not $Token) {
    Write-Host ""
    Write-Host "HATA: GITHUB_TOKEN bulunamadi." -ForegroundColor Red
    Write-Host "  scripts/push.config.example -> scripts/push.config.local kopyalayip token girin." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Test-Path ".git")) {
    Write-Host "Git deposu baslatiliyor..." -ForegroundColor Cyan
    git init
    git branch -M $Branch
}

$remotes = git remote 2>$null
if ($remotes -notcontains "origin") {
    git remote add origin $Remote
} else {
    git remote set-url origin $Remote
}

Write-Host "Degisiklikler kontrol ediliyor..." -ForegroundColor Cyan
git add -A

$status = git status --porcelain
if (-not $status) {
    Write-Host "Commit edilecek degisiklik yok. Push deneniyor..." -ForegroundColor Yellow
} else {
    Write-Host "Commit: $Message" -ForegroundColor Cyan
    git -c "user.email=$GitEmail" -c "user.name=$GitName" commit -m $Message
}

$PushUrl = "https://${Token}@github.com/motiweb-marketing/tas-kamping-asistani.git"
Write-Host "GitHub'a push ediliyor ($Branch)..." -ForegroundColor Cyan
git push $PushUrl $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Basarili! Vercel bagli ise deploy otomatik baslar." -ForegroundColor Green
    Write-Host "Repo: $Remote" -ForegroundColor Gray
} else {
    Write-Host "Push basarisiz (cikis kodu: $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}
