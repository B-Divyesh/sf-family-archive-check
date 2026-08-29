$ErrorActionPreference = "Stop"
$root = Join-Path ([System.IO.Path]::GetTempPath()) ("fac-installer-test-" + [guid]::NewGuid())
$env:FAC_DOWNLOADS_DIR = Join-Path $root "Downloads"
$env:TEMP = Join-Path $root "Temp"
New-Item -ItemType Directory -Path $env:TEMP -Force | Out-Null

function Invoke-RestMethod {
  return [pscustomobject]@{ assets = @(
    [pscustomobject]@{ name = "Family.Archive.Check.msi"; browser_download_url = "https://fixture.test/app.msi" },
    [pscustomobject]@{ name = "SHA256SUMS"; browser_download_url = "https://fixture.test/SHA256SUMS" }
  ) }
}

$global:FacInstallerTampered = $false
function Invoke-WebRequest {
  param([string]$Uri, [string]$OutFile)
  if ($Uri -like "*SHA256SUMS") {
    $bytes = [Text.Encoding]::UTF8.GetBytes("installer-bytes")
    $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLower()
    "$hash  Family.Archive.Check.msi" | Set-Content -NoNewline $OutFile
  } else {
    $(if ($global:FacInstallerTampered) { "tampered-bytes" } else { "installer-bytes" }) | Set-Content -NoNewline $OutFile
  }
}

try {
  & "$PSScriptRoot/../public/install.ps1"
  $saved = Join-Path $env:FAC_DOWNLOADS_DIR "Family.Archive.Check.msi"
  if (-not (Test-Path $saved)) { throw "Valid installer was not saved." }
  if ((Get-Content -Raw $saved) -ne "installer-bytes") { throw "Saved installer bytes changed." }

  Remove-Item $saved
  $global:FacInstallerTampered = $true
  $rejected = $false
  try { & "$PSScriptRoot/../public/install.ps1" } catch {
    if ($_.Exception.Message -like "*did not match its checksum*") { $rejected = $true } else { throw }
  }
  if (-not $rejected) { throw "Tampered installer was not rejected." }
  if (Test-Path $saved) { throw "Tampered installer reached Downloads." }
  Write-Host "PowerShell installer accepted valid bytes and rejected tampered bytes."
} finally {
  Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item Env:FAC_DOWNLOADS_DIR -ErrorAction SilentlyContinue
  Remove-Variable FacInstallerTampered -Scope Global -ErrorAction SilentlyContinue
}
