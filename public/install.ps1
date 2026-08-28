$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-family-archive-check"
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
if (-not $asset) { throw "The Windows release asset is not published yet." }
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $sums) { throw "The checksum file is not published yet." }
$download = Join-Path $env:TEMP $asset.name
$sumFile = Join-Path $env:TEMP "family-archive-check-SHA256SUMS"
Invoke-WebRequest $asset.browser_download_url -OutFile $download
Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
$expected = ((Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split '\s+')[0].ToLower()
$actual = (Get-FileHash $download -Algorithm SHA256).Hash.ToLower()
if ($expected -ne $actual) { Remove-Item $download; throw "The downloaded file did not match its checksum." }
$destination = Join-Path ([Environment]::GetFolderPath('UserProfile')) "Downloads\$($asset.name)"
Move-Item $download $destination -Force
Write-Host "Verified and saved $($asset.name) in Downloads. Open it to install."
