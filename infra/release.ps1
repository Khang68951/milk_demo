<#
.SYNOPSIS
  Packages server/ and infra/remote/, uploads them to S3 and updates the running server.

.EXAMPLE
  .\infra\release.ps1
  Upload and apply on the server through SSM Run Command.

.EXAMPLE
  .\infra\release.ps1 -UploadOnly
  Upload only (used by deploy.ps1 before the server exists).
#>
param(
    [string]$AwsProfile = "milk",
    [string]$Region = "ap-southeast-1",
    [string]$Project = "milk-demo",
    [switch]$UploadOnly
)

. "$PSScriptRoot\common.ps1"
$script:AwsProfile = $AwsProfile
$script:Region = $Region
$root = Split-Path -Parent $PSScriptRoot

$bucket = Get-StackOutput "$Project-base" "BucketName"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$tarball = Join-Path $env:TEMP "milk-release-$stamp.tar.gz"
& tar.exe --format ustar -czf $tarball --exclude=__pycache__ --exclude=*.pyc -C $root server infra/remote
if ($LASTEXITCODE -ne 0) { throw "tar failed" }
Invoke-Aws s3 cp $tarball "s3://$bucket/releases/$stamp.tar.gz" --only-show-errors | Out-Null
Invoke-Aws s3 cp $tarball "s3://$bucket/releases/current.tar.gz" --only-show-errors | Out-Null
Remove-Item $tarball
Write-Host "   release $stamp uploaded"
if ($UploadOnly) { return }

$instance = Get-StackOutput "$Project-server" "InstanceId"
$state = Invoke-Aws ec2 describe-instances --instance-ids $instance `
    --query "Reservations[0].Instances[0].State.Name" --output text
if ($state -ne "running") { throw "server $instance is $state; start it first (.\infra\server-power.ps1 -Start)" }

$params = Join-Path $env:TEMP "milk-ssm-$stamp.json"
'{"commands":["bash /opt/milk/app/infra/remote/update.sh"]}' | Out-File -FilePath $params -Encoding ascii
$commandId = Invoke-Aws ssm send-command --instance-ids $instance --document-name AWS-RunShellScript `
    --comment "milk release $stamp" --timeout-seconds 1800 --parameters "file://$params" `
    --query Command.CommandId --output text
Remove-Item $params
Write-Host "   applying on $instance (command $commandId)"
do {
    Start-Sleep -Seconds 5
    $status = Invoke-Aws ssm get-command-invocation --command-id $commandId --instance-id $instance `
        --query Status --output text
} while (@("Pending", "InProgress", "Delayed") -contains $status)
Invoke-Aws ssm get-command-invocation --command-id $commandId --instance-id $instance `
    --query "[StandardOutputContent,StandardErrorContent]" --output text | Select-Object -Last 25 | Out-Host
if ($status -ne "Success") { throw "update on the server ended with status $status" }
Write-Host "   release $stamp is live"
