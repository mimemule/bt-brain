# bt-brain — update (member-side)
# Run from the vault root:  powershell -ExecutionPolicy Bypass -File .brain\update.ps1
# Sequence: discard local edits to LOCKED paths -> commit CONTRIBUTABLE changes ->
# pull (merge) -> if local contributions exist, push to YOUR FORK + print PR link.
# State paths are gitignored and structurally untouchable. PS 5.1 compatible.
# All URLs are derived from this clone's own 'origin' remote - nothing hardcoded.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $root "Brain\README.md"))) {
    throw "Vault root not found (no Brain/README.md at $root)."
}
Set-Location $root

# --- derive upstream owner/repo from origin ---
$originUrl = git remote get-url origin
if ($LASTEXITCODE -ne 0) { throw "No 'origin' remote configured." }
if ($originUrl -notmatch 'github\.com[:/]([^/]+)/([^/.]+)') { throw "Could not parse owner/repo from origin URL: $originUrl" }
$upOwner = $Matches[1]; $upRepo = $Matches[2]

# --- parse manifest for class lists ---
$locked = @(); $contrib = @()
foreach ($line in Get-Content (Join-Path $PSScriptRoot "manifest.yml")) {
    if ($line -match '^\s+"([^"]+)":\s+(locked|contributable)\s*$') {
        if ($Matches[2] -eq "locked") { $locked += $Matches[1] } else { $contrib += $Matches[1] }
    }
}
if ($locked.Count -eq 0) { throw "No locked paths parsed from manifest.yml - aborting." }

# --- 1. discard local edits to locked paths (the lock IS the update mechanism) ---
$existingLocked = @($locked | Where-Object { Test-Path (Join-Path $root $_) })
if ($existingLocked.Count -gt 0) {
    git checkout --quiet -- $existingLocked
    if ($LASTEXITCODE -ne 0) { throw "Failed to reset locked paths (git checkout exit $LASTEXITCODE)." }
    Write-Host "[ok] locked paths reset to canonical"
}

# --- 2. commit contributable changes locally ---
git add -- $contrib
if ($LASTEXITCODE -ne 0) { throw "git add failed (exit $LASTEXITCODE)." }
git diff --cached --quiet
$hasContrib = ($LASTEXITCODE -ne 0)
if ($hasContrib) {
    $who = git config user.name
    git commit --quiet -m "Contribution: $who $(Get-Date -Format yyyy-MM-dd)"
    if ($LASTEXITCODE -ne 0) { throw "git commit failed (exit $LASTEXITCODE)." }
    Write-Host "[ok] local contributions committed"
}

# --- 3. pull: merge upstream engine (contributable merges; locked fast-forwards) ---
git pull --no-rebase --no-edit --quiet origin main
if ($LASTEXITCODE -ne 0) {
    throw "git pull failed (exit $LASTEXITCODE). If this is a merge conflict in a contributable folder, ask Claude Code to resolve it, then re-run."
}
Write-Host "[ok] engine updated from origin/main"

# --- 4. propose contributions: push local commits to YOUR FORK as a contrib branch ---
# Members have read-only access to the shared repo (main is unpushable by design).
$ahead = git rev-list --count origin/main..HEAD
if ([int]$ahead -gt 0) {
    $forkUrl = git remote get-url fork 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $forkUrl) {
        Write-Host "No 'fork' remote configured yet (one-time setup):"
        Write-Host "  1. Create your private fork (one click): https://github.com/$upOwner/$upRepo/fork"
        $ghUser = Read-Host "  2. Your GitHub username"
        if (-not $ghUser) { throw "GitHub username required to configure the fork remote." }
        git remote add fork "https://github.com/$ghUser/$upRepo.git"
        if ($LASTEXITCODE -ne 0) { throw "Failed to add fork remote (exit $LASTEXITCODE)." }
        $forkUrl = git remote get-url fork
    }
    $ghUser = ($forkUrl -replace '^https://github\.com/', '') -replace '/.*$', ''
    $who = (git config user.name) -replace '[^A-Za-z0-9]', '-'
    $branch = "contrib/$who"
    git push --quiet fork "HEAD:refs/heads/$branch"
    if ($LASTEXITCODE -ne 0) {
        throw "Push to your fork failed (exit $LASTEXITCODE). If the fork doesn't exist yet, create it at https://github.com/$upOwner/$upRepo/fork and re-run."
    }
    Write-Host "[ok] contributions pushed to your fork ($branch)"
    Write-Host ""
    Write-Host "Propose them to your engine maintainer (one click):"
    Write-Host "  https://github.com/$upOwner/$upRepo/compare/main...$($ghUser):$($upRepo):$($branch -replace '/','%2F')?expand=1"
} else {
    Write-Host "[ok] no local contributions pending"
}

Write-Host ""
Write-Host "Update complete."
