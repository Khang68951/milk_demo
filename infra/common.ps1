# Shared helpers for the deploy scripts. Dot-source it: . "$PSScriptRoot\common.ps1"
# Works in Windows PowerShell 5.1 and PowerShell 7.

$ErrorActionPreference = "Stop"

function Find-AwsCli {
    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $local = Join-Path $env:LOCALAPPDATA "Programs\awscli\Amazon\AWSCLIV2\aws.exe"
    if (Test-Path $local) { return $local }
    throw "AWS CLI not found. Install AWS CLI v2 first."
}

$script:AwsExe = Find-AwsCli

function Invoke-Aws {
    # Runs the AWS CLI with the chosen profile and region; throws on a non-zero exit code.
    $output = & $script:AwsExe @args --profile $script:AwsProfile --region $script:Region
    if ($LASTEXITCODE -ne 0) { throw "aws $($args -join ' ') failed (exit $LASTEXITCODE)" }
    return $output
}

function Test-AwsParameter([string]$Name) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $script:AwsExe ssm get-parameter --name $Name --profile $script:AwsProfile --region $script:Region `
        --query Parameter.Name --output text 2>$null | Out-Null
    $found = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $previous
    return $found
}

function Get-StackOutput([string]$Stack, [string]$Key) {
    return Invoke-Aws cloudformation describe-stacks --stack-name $Stack `
        --query "Stacks[0].Outputs[?OutputKey=='$Key'].OutputValue" --output text
}

function New-RandomHex([int]$Bytes = 24) {
    $buffer = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($buffer)
    $rng.Dispose()
    return -join ($buffer | ForEach-Object { $_.ToString("x2") })
}
