$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$htmlPath = Join-Path $projectRoot 'index.html'
$html = Get-Content -Raw -LiteralPath $htmlPath

$checks = @(
    @{ Name = 'Bill Cipher existe como recurso local'; Pass = Test-Path -LiteralPath (Join-Path $projectRoot 'assets/bill-cipher.gif') },
    @{ Name = 'GIF central existe como recurso local'; Pass = Test-Path -LiteralPath (Join-Path $projectRoot 'assets/happy-birthday.gif') },
    @{ Name = 'Música existe como recurso local'; Pass = Test-Path -LiteralPath (Join-Path $projectRoot 'audio/gravity-falls-intro.mp3') },
    @{ Name = 'La portada usa Bill Cipher'; Pass = $html.Contains('src="./assets/bill-cipher.gif"') },
    @{ Name = 'La carta muestra solo el GIF central aprobado'; Pass = $html.Contains('class="birthday-feature"') -and $html.Contains('src="./assets/happy-birthday.gif"') },
    @{ Name = 'El reproductor usa la música local'; Pass = $html.Contains('src="./audio/gravity-falls-intro.mp3"') }
)

$failed = @($checks | Where-Object { -not $_.Pass })
$checks | ForEach-Object {
    $mark = if ($_.Pass) { 'PASS' } else { 'FAIL' }
    Write-Host "[$mark] $($_.Name)"
}

if ($failed.Count -gt 0) {
    throw "$($failed.Count) comprobaciones fallaron."
}

Write-Host "Todas las $($checks.Count) comprobaciones pasaron."
