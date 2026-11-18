<#
.SYNOPSIS
  Switches what the system counts: the store camera, or the recorded replay video (demo fallback).
  Updates the hub (SSM settings, then a release) and the GPU worker's stream path over SSH.

.EXAMPLE
  .\infra\switch-source.ps1 -Source camera
.EXAMPLE
  .\infra\switch-source.ps1 -Source replay
#>
param(
    [Parameter(Mandatory = $true)][ValidateSet("camera", "replay")][string]$Source,
    [string]$CameraPath = "cam-s01-a",
    [string]$WorkerHost = $env:LONG_HOST,
    [string]$WorkerEnv = "~/Desktop/Datagent/milk_demo/worker.env",
    [string]$AwsProfile = "milk",
    [string]$Region = "ap-southeast-1",
    [string]$Project = "milk-demo"
)

. "$PSScriptRoot\common.ps1"
$script:AwsProfile = $AwsProfile
$script:Region = $Region

$path = if ($Source -eq "camera") { $CameraPath } else { "cam-replay" }
$replay = if ($Source -eq "replay") { "on" } else { "off" }
Invoke-Aws ssm put-parameter --name "/$Project/counter/source_path" --type String --value $path --overwrite | Out-Null
Invoke-Aws ssm put-parameter --name "/$Project/counter/replay" --type String --value $replay --overwrite | Out-Null
Write-Host "hub: source_path=$path, replay=$replay"
& "$PSScriptRoot\release.ps1" -AwsProfile $AwsProfile -Region $Region -Project $Project

if ($WorkerHost) {
    $remote = "sed -i -E 's#^(MILK_STREAM_URL=rtsps://[^/]+/).*#\1$path#' $WorkerEnv && systemctl --user restart milk-worker && echo worker: `$(systemctl --user is-active milk-worker), stream path $path"
    & ssh -o BatchMode=yes $WorkerHost $remote
    if ($LASTEXITCODE -ne 0) { throw "could not update the worker on $WorkerHost" }
} else {
    Write-Host "no worker host given (set LONG_HOST); update MILK_STREAM_URL on the GPU worker by hand"
}
