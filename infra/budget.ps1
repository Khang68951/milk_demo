<#
.SYNOPSIS
  Creates a monthly cost budget that ignores credits, so alerts fire on real usage
  even while free-tier credits pay the bill (IncludeCredit defaults to true otherwise).

.EXAMPLE
  .\infra\budget.ps1 -Email you@example.com -LimitUsd 100
#>
param(
    [Parameter(Mandatory = $true)][string]$Email,
    [int]$LimitUsd = 100,
    [string]$Name = "milk-demo-gross",
    [string]$AwsProfile = "milk",
    [string]$Region = "ap-southeast-1"
)

. "$PSScriptRoot\common.ps1"
$script:AwsProfile = $AwsProfile
$script:Region = $Region

$account = Invoke-Aws sts get-caller-identity --query Account --output text
$budget = @{
    BudgetName  = $Name
    BudgetType  = "COST"
    TimeUnit    = "MONTHLY"
    BudgetLimit = @{ Amount = "$LimitUsd"; Unit = "USD" }
    CostTypes   = @{
        IncludeCredit = $false; IncludeRefund = $false; IncludeTax = $true; IncludeSubscription = $true
        IncludeRecurring = $true; IncludeOtherSubscription = $true; IncludeSupport = $true
        IncludeDiscount = $true; IncludeUpfront = $true; UseBlended = $false; UseAmortized = $false
    }
}
$notifications = @()
foreach ($pct in 20, 50, 80, 100) {
    $notifications += @{
        Notification = @{ NotificationType = "ACTUAL"; ComparisonOperator = "GREATER_THAN"; Threshold = $pct; ThresholdType = "PERCENTAGE" }
        Subscribers  = @(@{ SubscriptionType = "EMAIL"; Address = $Email })
    }
}
$notifications += @{
    Notification = @{ NotificationType = "FORECASTED"; ComparisonOperator = "GREATER_THAN"; Threshold = 100; ThresholdType = "PERCENTAGE" }
    Subscribers  = @(@{ SubscriptionType = "EMAIL"; Address = $Email })
}

$budgetFile = Join-Path $env:TEMP "milk-budget.json"
$notifyFile = Join-Path $env:TEMP "milk-budget-notify.json"
$budget | ConvertTo-Json -Depth 5 | Out-File -FilePath $budgetFile -Encoding ascii
ConvertTo-Json -InputObject $notifications -Depth 6 | Out-File -FilePath $notifyFile -Encoding ascii
try {
    Invoke-Aws budgets create-budget --account-id $account --budget "file://$budgetFile" `
        --notifications-with-subscribers "file://$notifyFile" | Out-Null
    Write-Host "budget $Name created: $LimitUsd USD/month, alerts at 20/50/80/100% actual and 100% forecast, credits excluded"
} finally {
    Remove-Item $budgetFile, $notifyFile -ErrorAction SilentlyContinue
}
