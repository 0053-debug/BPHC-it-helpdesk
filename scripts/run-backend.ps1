$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $repositoryRoot '.env'
$backendDirectory = Join-Path $repositoryRoot 'backend'

if (-not (Test-Path -LiteralPath $environmentFile -PathType Leaf)) {
    throw "Missing root .env file: $environmentFile"
}

foreach ($line in Get-Content -LiteralPath $environmentFile) {
    if ($line -match '^\s*(?:#|$)') {
        continue
    }

    if ($line -notmatch '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$') {
        continue
    }

    $name = $Matches[1]
    $value = $Matches[2].Trim()

    if ($value.Length -ge 2) {
        $first = $value[0]
        $last = $value[$value.Length - 1]
        if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }
    }

    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

Push-Location $backendDirectory
try {
    & .\mvnw.cmd spring-boot:run
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}
