<#
.SYNOPSIS
    Gives .praxis files the PRAXIS Workbench icon in Windows Explorer.

.DESCRIPTION
    A .praxis file is JSON, so Windows draws it as a blank page and nothing about it
    says which application it belongs to. This registers a file type for it under the
    CURRENT USER only (HKCU:\Software\Classes), which needs no administrator rights
    and touches nothing machine-wide.

    What it does:
      * copies praxis-file.ico to %LOCALAPPDATA%\PRAXIS so the icon keeps working if
        this repository is moved, renamed or deleted
      * points the .praxis extension at a PRAXIS.Workbench.Project file type
      * gives that type the icon and the name "PRAXIS Workbench evaluation project"
      * makes double-click open the Workbench in the default browser

    On the double-click behaviour, plainly: the browser is opened at the Workbench,
    but the file is NOT loaded into it automatically. A web page cannot be handed a
    local file by the operating system without the user picking it, and no registry
    entry changes that. You still choose "Open .praxis File" (or drag the file onto
    the page). The icon is the real win here; the open verb just saves finding the
    bookmark.

    Reverse it at any time with Uninstall-PraxisFileAssociation.ps1.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\Install-PraxisFileAssociation.ps1
#>
[CmdletBinding()]
param(
    [string]$WorkbenchUrl = 'https://www.emmanuelneneodjidja.org/praxis/workbench/'
)

$ErrorActionPreference = 'Stop'

$ProgId       = 'PRAXIS.Workbench.Project'
$FriendlyName = 'PRAXIS Workbench evaluation project'
$InstallDir   = Join-Path $env:LOCALAPPDATA 'PRAXIS'
$IconTarget   = Join-Path $InstallDir 'praxis-file.ico'
$IconSource   = Join-Path $PSScriptRoot 'praxis-file.ico'

if (-not (Test-Path -LiteralPath $IconSource)) {
    throw "Icon not found next to this script: $IconSource"
}

# Copy the icon somewhere stable. The registry stores a path, so pointing it at a
# working copy of the site repo would break the moment that folder moved.
if (-not (Test-Path -LiteralPath $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}
Copy-Item -LiteralPath $IconSource -Destination $IconTarget -Force
Write-Host "Icon installed to $IconTarget"

function Set-RegDefault {
    param([string]$Path, [string]$Value)
    if (-not (Test-Path -LiteralPath $Path)) { New-Item -Path $Path -Force | Out-Null }
    New-ItemProperty -LiteralPath $Path -Name '(default)' -Value $Value -PropertyType String -Force | Out-Null
}

$classes = 'HKCU:\Software\Classes'

# The file type itself.
Set-RegDefault "$classes\$ProgId" $FriendlyName
Set-RegDefault "$classes\$ProgId\DefaultIcon" "`"$IconTarget`""

# Double-click opens the Workbench. url.dll's FileProtocolHandler hands the URL to
# whatever the user's default browser is rather than hardcoding one.
Set-RegDefault "$classes\$ProgId\shell\open\command" `
    "rundll32.exe url.dll,FileProtocolHandler $WorkbenchUrl"

# Point the extension at the type, and register it in the Open With list so the
# choice is visible and reversible from Explorer rather than only from here.
Set-RegDefault "$classes\.praxis" $ProgId
New-ItemProperty -LiteralPath "$classes\.praxis" -Name 'Content Type' -Value 'application/json' -PropertyType String -Force | Out-Null
New-ItemProperty -LiteralPath "$classes\.praxis" -Name 'PerceivedType' -Value 'text' -PropertyType String -Force | Out-Null

$progIds = "$classes\.praxis\OpenWithProgids"
if (-not (Test-Path -LiteralPath $progIds)) { New-Item -Path $progIds -Force | Out-Null }
New-ItemProperty -LiteralPath $progIds -Name $ProgId -Value ([byte[]]@()) -PropertyType None -Force | Out-Null

Write-Host "Registered .praxis -> $ProgId (current user only)"

# Explorer caches icons aggressively and will happily keep drawing the blank page
# until something tells it the association changed.
$sig = @'
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int eventId, uint flags, IntPtr item1, IntPtr item2);
'@
$shell = Add-Type -MemberDefinition $sig -Name 'PraxisShellNotify' -Namespace 'Praxis' -PassThru
$SHCNE_ASSOCCHANGED = 0x08000000
$SHCNF_IDLIST = 0x0000
$shell::SHChangeNotify($SHCNE_ASSOCCHANGED, $SHCNF_IDLIST, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host ''
Write-Host 'Done. .praxis files now show the PRAXIS Workbench icon.' -ForegroundColor Green
Write-Host 'If a folder still shows the old blank icon, press F5 in it.'
Write-Host 'To undo: Uninstall-PraxisFileAssociation.ps1'
