<#
.SYNOPSIS
    Removes the .praxis file association added by Install-PraxisFileAssociation.ps1.

.DESCRIPTION
    Deletes the PRAXIS.Workbench.Project file type, the .praxis extension key and the
    installed icon, all under the current user only. Your .praxis files are untouched;
    they simply go back to showing a blank page icon.

    Windows may also hold a per-user "you chose this app" override at
    HKCU:\...\FileExts\.praxis, set by picking something in the Open With dialog. That
    is the user's own choice rather than ours to make, so it is reported and left
    alone rather than deleted behind their back.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Uninstall-PraxisFileAssociation.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$ProgId     = 'PRAXIS.Workbench.Project'
$classes    = 'HKCU:\Software\Classes'
$InstallDir = Join-Path $env:LOCALAPPDATA 'PRAXIS'
$IconTarget = Join-Path $InstallDir 'praxis-file.ico'
$removed    = @()

foreach ($path in @("$classes\$ProgId", "$classes\.praxis")) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force
        $removed += $path
    }
}

if (Test-Path -LiteralPath $IconTarget) {
    Remove-Item -LiteralPath $IconTarget -Force
    $removed += $IconTarget
    # Only remove the folder if it is ours and now empty; something else may live there.
    if (-not (Get-ChildItem -LiteralPath $InstallDir -Force)) {
        Remove-Item -LiteralPath $InstallDir -Force
        $removed += $InstallDir
    }
}

if ($removed.Count -eq 0) {
    Write-Host 'Nothing to remove: the association is not installed.'
} else {
    $removed | ForEach-Object { Write-Host "Removed $_" }
}

$fileExts = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.praxis'
if (Test-Path -LiteralPath $fileExts) {
    Write-Host ''
    Write-Host 'Note: Windows still holds your own Open With choice for .praxis at' -ForegroundColor Yellow
    Write-Host "  $fileExts" -ForegroundColor Yellow
    Write-Host 'That was set by picking an app in the Open With dialog, so it is left as you set it.'
    Write-Host 'Clear it from Settings > Apps > Default apps if you want a clean slate.'
}

$sig = @'
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int eventId, uint flags, IntPtr item1, IntPtr item2);
'@
$shell = Add-Type -MemberDefinition $sig -Name 'PraxisShellNotifyUninstall' -Namespace 'Praxis' -PassThru
$shell::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
