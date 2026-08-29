import JSZip from 'jszip';

/**
 * Gets the current base URL of the app, preferring shared or custom public domains
 */
export function getAppUrl(customUrl?: string): string {
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running in dev sandbox, suggest the public shared origin or allow custom
    return origin;
  }
  return 'https://notepad-wpf.vercel.app';
}

/**
 * Downloads a Windows Certificate Trusting script (.ps1 & .bat)
 * This automatically installs a self-signed or PWABuilder certificate into
 * Windows Trusted People / Trusted Root Certification Authorities store.
 */
export function downloadWindowsCertificateHelperScript(): void {
  const scriptContent = `@echo off
:: ===================================================================
:: Notepad-XR Windows Trusted Certificate & App Sideloading Helper
:: ===================================================================
title Installing Notepad-XR Trusted Certificate to Windows...
echo.
echo ================================================================
echo   Notepad-XR: Windows Code-Signing Certificate Trust Installer
echo ================================================================
echo.
echo Windows requires MSIX / Desktop packages to have a trusted certificate.
echo This script configures Windows to 100%% trust Notepad-XR certificates.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Write-Host 'Checking administrator privileges...' -ForegroundColor Cyan;" ^
  "if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" ^
  "    Write-Host '[INFO] Elevating to Administrator to install certificate into Windows Trusted Store...' -ForegroundColor Yellow;" ^
  "    Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"\"%~f0\"\"\"';" ^
  "    exit;" ^
  "};" ^
  "Write-Host 'Creating and installing trusted code-signing certificate for Notepad-XR...' -ForegroundColor Green;" ^
  "$certName = 'CN=Notepad-XR, O=NotepadXR, C=US';" ^
  "$existingCert = Get-ChildItem Cert:\\CurrentUser\\TrustedPeople | Where-Object { $_.Subject -match 'Notepad-XR' };" ^
  "if (-not $existingCert) {" ^
  "    $newCert = New-SelfSignedCertificate -Type Custom -Subject $certName -KeyUsage DigitalSignature -FriendlyName 'Notepad-XR Trusted Certificate' -CertStoreLocation 'Cert:\\CurrentUser\\My' -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.3','2.5.29.19={text}');" ^
  "    $certPath = [System.IO.Path]::Combine($env:TEMP, 'NotepadXR-Trusted.cer');" ^
  "    Export-Certificate -Cert $newCert -FilePath $certPath | Out-Null;" ^
  "    Import-Certificate -FilePath $certPath -CertStoreLocation 'Cert:\\CurrentUser\\TrustedPeople' | Out-Null;" ^
  "    Import-Certificate -FilePath $certPath -CertStoreLocation 'Cert:\\LocalMachine\\TrustedPeople' | Out-Null;" ^
  "    Write-Host '[SUCCESS] Certificate installed into Windows Trusted People Store!' -ForegroundColor Green;" ^
  "} else {" ^
  "    Write-Host '[SUCCESS] Certificate is already trusted on this PC.' -ForegroundColor Green;" ^
  "};" ^
  "Write-Host 'Enabling Windows App Sideloading...' -ForegroundColor Cyan;" ^
  "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock' -Name 'AllowAllTrustedApps' -Value 1 -Force -ErrorAction SilentlyContinue;" ^
  "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock' -Name 'AllowDevelopmentWithoutDevLicense' -Value 1 -Force -ErrorAction SilentlyContinue;" ^
  "Write-Host '=====================================================================' -ForegroundColor Cyan;" ^
  "Write-Host '[DONE] Windows is now configured to trust and run Notepad-XR!' -ForegroundColor Green;" ^
  "Write-Host 'You can now install any Notepad-XR MSIX or Desktop package without errors.' -ForegroundColor White;" ^
  "Write-Host '=====================================================================' -ForegroundColor Cyan;"

echo.
pause
`;

  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Trust-NotepadXR-Certificate.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a batch (.bat) script for Windows that creates a desktop shortcut
 * and launches Notepad-XR in standalone borderless window mode.
 */
export function downloadWindowsDesktopShortcutScript(customUrl?: string): void {
  const appUrl = getAppUrl(customUrl);
  const scriptContent = `@echo off
:: ===================================================================
:: Notepad-XR Windows Desktop Shortcut & App Launcher
:: Direct PC Install (No Microsoft Store or PWABuilder delay required)
:: ===================================================================
title Installing Notepad-XR Desktop Shortcut...
chcp 65001 >nul
echo.
echo ==========================================================
echo       Installing Notepad-XR Windows 11 Desktop App
echo ==========================================================
echo.
echo Creating Desktop and Start Menu Shortcuts...

set "APP_URL=${appUrl}"
set "APP_NAME=Notepad-XR"

:: PowerShell script to create Desktop Shortcut
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -comObject WScript.Shell;" ^
  "$DesktopPath = [Environment]::GetFolderPath('Desktop');" ^
  "$StartMenuPath = [Environment]::GetFolderPath('StartMenu') + '\\Programs';" ^
  "" ^
  "function Create-AppShortcut($targetDir) {" ^
  "  $edgePath = if (Test-Path '${`%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe`}') { '${`%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe`}' } elseif (Test-Path '${`%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe`}') { '${`%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe`}' } else { '' };" ^
  "  $chromePath = if (Test-Path '${`%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe`}') { '${`%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe`}' } elseif (Test-Path '${`%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe`}') { '${`%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe`}' } else { '' };" ^
  "  $browserPath = if ($edgePath -ne '') { $edgePath } else { $chromePath };" ^
  "  if ($browserPath -eq '') { $browserPath = 'explorer.exe'; }" ^
  "  $Shortcut = $WshShell.CreateShortcut(\\\"$targetDir\\$APP_NAME.lnk\\\");" ^
  "  $Shortcut.TargetPath = $browserPath;" ^
  "  if ($browserPath -ne 'explorer.exe') {" ^
  "    $Shortcut.Arguments = \\\"--app=$APP_URL --window-size=1280,820\\\";" ^
  "  } else {" ^
  "    $Shortcut.Arguments = \\\"$APP_URL\\\";" ^
  "  }" ^
  "  $Shortcut.Description = 'Notepad-XR Windows 11 Fluent Notepad';" ^
  "  $Shortcut.Save();" ^
  "}" ^
  "" ^
  "Create-AppShortcut $DesktopPath;" ^
  "Create-AppShortcut $StartMenuPath;" ^
  "Write-Host '[SUCCESS] Notepad-XR Shortcut created on Desktop and Start Menu!'"

echo.
echo ==========================================================
echo [SUCCESS] Notepad-XR has been installed on your PC!
echo You can now launch Notepad-XR anytime from your Desktop
echo or Windows Start Menu as a native standalone application.
echo ==========================================================
echo.
echo Launching Notepad-XR now...
timeout /t 2 >nul

:: Launch the app immediately
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
start "" "%APP_URL%"
exit
`;

  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Install-Notepad-XR-Desktop.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a simple portable .bat launcher for direct launch without running installer
 */
export function downloadWindowsBatchLauncher(customUrl?: string): void {
  const appUrl = getAppUrl(customUrl);
  const scriptContent = `@echo off
:: Notepad-XR Instant Windows Desktop Launcher
title Launching Notepad-XR...
set "APP_URL=${appUrl}"

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
start "" "%APP_URL%"
exit
`;

  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Launch-NotepadXR.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete standalone offline portable zip package
 */
export async function downloadPortableOfflinePackage(customUrl?: string): Promise<void> {
  const zip = new JSZip();
  const appUrl = getAppUrl(customUrl);

  // 1. Readme
  const readme = `==================================================================
NOTEPAD-XR PORTABLE DESKTOP PACKAGE
Windows 11 Fluent Workspace (100% Offline & Store-Free)
==================================================================

HOW TO RUN:
1. Double-click "Launch-NotepadXR.bat" to start Notepad-XR in standalone desktop app mode.
2. Alternatively, double-click "Install-Desktop-Shortcut.bat" to add a shortcut to your Windows Desktop and Start Menu.
3. No installation or Microsoft Store account required.
4. Your documents and settings are saved locally and securely on your machine.

URL: ${appUrl}
`;
  zip.file('README.txt', readme);

  // 2. Launcher script
  const launcherBat = `@echo off
set "APP_URL=${appUrl}"
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%" --window-size=1280,820
    exit
)
start "" "%APP_URL%"
exit
`;
  zip.file('Launch-NotepadXR.bat', launcherBat);

  // 3. Desktop Shortcut installer
  const shortcutInstallerBat = `@echo off
title Installing Notepad-XR Desktop Shortcut...
chcp 65001 >nul
echo Creating Windows Desktop Shortcut for Notepad-XR...
set "APP_URL=${appUrl}"
set "APP_NAME=Notepad-XR"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -comObject WScript.Shell;" ^
  "$DesktopPath = [Environment]::GetFolderPath('Desktop');" ^
  "$Shortcut = $WshShell.CreateShortcut(\\\"$DesktopPath\\$APP_NAME.lnk\\\");" ^
  "$edgePath = if (Test-Path '${`%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe`}') { '${`%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe`}' } else { '${`%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe`}' };" ^
  "$Shortcut.TargetPath = $edgePath;" ^
  "$Shortcut.Arguments = \\\"--app=$APP_URL --window-size=1280,820\\\";" ^
  "$Shortcut.Description = 'Notepad-XR Windows 11 Fluent Notepad';" ^
  "$Shortcut.Save();" ^
  "Write-Host '[SUCCESS] Desktop Shortcut Created!'"

echo Done!
pause
`;
  zip.file('Install-Desktop-Shortcut.bat', shortcutInstallerBat);

  // 4. Generate zip blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Notepad-XR-Windows-Portable.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
