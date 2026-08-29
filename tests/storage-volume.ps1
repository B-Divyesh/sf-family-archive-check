Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Windows hosted runners provide a mounted NTFS workspace. Exercise the native scanner there.
$root = Join-Path $env:RUNNER_TEMP ("family-archive-check-ntfs-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root | Out-Null

try {
  $filesystem = (Get-Volume -FilePath $root).FileSystem
  if ($filesystem -ne 'NTFS') { throw "Expected an NTFS mounted volume, got $filesystem." }
  Copy-Item (Join-Path $PSScriptRoot 'fixtures/valid.*') -Destination $root
  $env:FAC_VOLUME_FIXTURE_ROOT = $root
  $env:FAC_EXPECTED_FILESYSTEM = 'ntfs'
  cargo test --manifest-path src-tauri/Cargo.toml mounted_volume_fixture -- --exact
} finally {
  Remove-Item -LiteralPath $root -Recurse -Force -ErrorAction SilentlyContinue
}
