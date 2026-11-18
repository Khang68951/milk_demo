<#
.SYNOPSIS
  Runs a shell command on the demo server through SSM Run Command and prints its output.
  No SSH port is open on the server; this is the way in.

.EXAMPLE
  .\infra\remote-run.ps1 "systemctl status mediamtx milk-web milk-counter --no-pager"
.EXAMPLE
  .\infra\remote-run.ps1 "journalctl -u milk-counter -n 50 --no-pager"
#>
param(
    [Parameter(Mandatory = $true, Position = 0)][string]$Command,
    [int]$TimeoutSeconds = 600,
    [string]$AwsProfile = "milk",
    [string]$Region = "ap-southeast-1",
    [string]$Project = "milk-demo"
)

. "$PSScriptRoot\common.ps1"
$script:AwsProfile = $AwsProfile
$script:Region = $Region

$instance = Get-StackOutput "$Project-server" "InstanceId"
$params = Join-Path $env:TEMP ("milk-ssm-{0}.json" -f [guid]::NewGuid())
@{ commands = @($Command) } | ConvertTo-Json -Compress | Out-File -FilePath $params -Encoding ascii
try {
    $commandId = Invoke-Aws ssm send-command --instance-ids $instance --document-name AWS-RunShellScript `
        --timeout-seconds $TimeoutSeconds --parameters "file://$params" --query Command.CommandId --output text
} finally {
    Remove-Item $params -ErrorAction SilentlyContinue
}
do {
    Start-Sleep -Seconds 2
    $status = Invoke-Aws ssm get-command-invocation --command-id $commandId --instance-id $instance `
        --query Status --output text
} while (@("Pending", "InProgress", "Delayed") -contains $status)
Invoke-Aws ssm get-command-invocation --command-id $commandId --instance-id $instance `
    --query StandardOutputContent --output text | Out-Host
$errors = Invoke-Aws ssm get-command-invocation --command-id $commandId --instance-id $instance `
    --query StandardErrorContent --output text
if ($errors -and $errors -ne "None") { Write-Host "--- stderr"; $errors | Out-Host }
if ($status -ne "Success") { Write-Host "status: $status" }
