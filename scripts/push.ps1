# Taş Kamping Asistanı — GitHub push + Vercel prod deploy (otomatik yeniden dene)
# Kullanım: .\push.ps1
#           .\push.ps1 -Message "feat: aciklama"

param(
    [string]$Message = "chore: proje guncellemesi",
    [int]$MaxRetries = 3
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$ConfigFile = Join-Path $PSScriptRoot "push.config.local"
if (Test-Path $ConfigFile) {
    Get-Content $ConfigFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
            Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim()
        }
    }
}

$GitEmail = if ($env:GIT_USER_EMAIL) { $env:GIT_USER_EMAIL } else { "seo.okacar@gmail.com" }
$GitName  = if ($env:GIT_USER_NAME)  { $env:GIT_USER_NAME }  else { "motiweb-marketing" }
$Remote   = "https://github.com/motiweb-marketing/tas-kamping-asistani.git"
$Branch   = "main"

function Write-Step($text) {
    Write-Host $text -ForegroundColor Cyan
}

function Invoke-WithRetry {
    param(
        [string]$Label,
        [scriptblock]$Action,
        [scriptblock]$OnFailure
    )

    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    for ($i = 1; $i -le $MaxRetries; $i++) {
        Write-Step "$Label (deneme $i/$MaxRetries)..."
        $result = & $Action
        $exitCode = if ($null -ne $result -and $result -is [int]) { $result } else { $LASTEXITCODE }

        if ($exitCode -eq 0) {
            $ErrorActionPreference = $prevEap
            return $true
        }

        Write-Host "  HATA: Cikis kodu $exitCode" -ForegroundColor Red
        if ($i -lt $MaxRetries -and $OnFailure) {
            Write-Host "  Duzeltme deneniyor..." -ForegroundColor Yellow
            & $OnFailure
            Start-Sleep -Seconds 2
        } elseif ($i -eq $MaxRetries) {
            $ErrorActionPreference = $prevEap
            throw "$Label $MaxRetries denemeden sonra basarisiz (kod: $exitCode)"
        }
    }

    $ErrorActionPreference = $prevEap
    return $false
}

function Ensure-GitRepo {
    if (-not (Test-Path ".git")) {
        git init
        git branch -M $Branch
    }
    $remotes = git remote 2>$null
    if ($remotes -notcontains "origin") {
        git remote add origin $Remote
    } else {
        git remote set-url origin $Remote
    }
}

function Push-GitHub {
    $Token = $env:GITHUB_TOKEN
    if (-not $Token) { throw "GITHUB_TOKEN bulunamadi (scripts/push.config.local)" }

    Ensure-GitRepo

    git add -A
    $status = git status --porcelain
    if ($status) {
        Write-Step "Git: commit -> $Message"
        git -c "user.email=$GitEmail" -c "user.name=$GitName" commit -m $Message
        if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
    } else {
        Write-Host "Git: commit edilecek degisiklik yok." -ForegroundColor Yellow
    }

    $PushUrl = "https://${Token}@github.com/motiweb-marketing/tas-kamping-asistani.git"
    git push $PushUrl $Branch 2>&1 | ForEach-Object { Write-Host $_ }
    return $LASTEXITCODE
}

function Fix-GitPush {
    $Token = $env:GITHUB_TOKEN
    $PushUrl = "https://${Token}@github.com/motiweb-marketing/tas-kamping-asistani.git"
    Write-Host "  Uzak dal cekiliyor (rebase)..." -ForegroundColor Yellow
    git pull $PushUrl $Branch --rebase 2>&1 | Out-String | Write-Host
}

function Test-Build {
    Write-Step "Build kontrolu (npm run build)..."
    npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    return $LASTEXITCODE
}

function Get-VercelArgs {
    param([string[]]$Extra)
    $args = @("--yes", "--token", $env:VERCEL_TOKEN) + $Extra
    if ($env:VERCEL_SCOPE) { $args += @("--scope", $env:VERCEL_SCOPE) }
    return $args
}

function Deploy-Vercel {
    if (-not $env:VERCEL_TOKEN) {
        Write-Host "VERCEL_TOKEN bulunamadi" -ForegroundColor Red
        return 1
    }

    $vercelArgs = Get-VercelArgs @("deploy", "--prod")
    npx vercel @vercelArgs 2>&1 | ForEach-Object { Write-Host $_ }
    return $LASTEXITCODE
}

function Fix-VercelDeploy {
    if (-not (Test-Path ".vercel/project.json")) {
        Write-Host "  Vercel projesi linkleniyor..." -ForegroundColor Yellow
        $linkArgs = Get-VercelArgs @("link", "--project", "tas-kamping-asistani")
        npx vercel @linkArgs 2>&1 | ForEach-Object { Write-Host $_ }
    }

    Write-Host "  node_modules ve .next temizleniyor..." -ForegroundColor Yellow
    if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
    npm install 2>&1 | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "=== Tas Kamping Deploy (GitHub + Vercel) ===" -ForegroundColor White
Write-Host ""

try {
    Invoke-WithRetry -Label "GitHub Push" -Action { Push-GitHub } -OnFailure { Fix-GitPush }
    Write-Host "GitHub push basarili." -ForegroundColor Green

    Invoke-WithRetry -Label "Vercel Deploy" -Action {
        $buildCode = Test-Build
        if ($buildCode -ne 0) { return $buildCode }
        Deploy-Vercel
    } -OnFailure { Fix-VercelDeploy }

    Write-Host ""
    Write-Host "Tamamlandi!" -ForegroundColor Green
    Write-Host "  GitHub: $Remote" -ForegroundColor Gray
    Write-Host "  Vercel: production deploy" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "DEPLOY BASARISIZ: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
