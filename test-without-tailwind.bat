@echo off
REM test-without-tailwind.bat
REM Test the app without Tailwind to isolate the issue

echo ========================================
echo Testing App Without Tailwind CSS
echo ========================================
echo.
echo This will temporarily use a basic CSS file instead of Tailwind.
echo.
pause

echo Backing up main.tsx...
copy /Y src\main.tsx src\main.tsx.backup

echo.
echo Updating main.tsx to use fallback CSS...
powershell -Command "(Get-Content src\main.tsx) -replace './styles/globals.css', './styles/fallback.css' | Set-Content src\main.tsx"

echo.
echo Starting development server with fallback CSS...
echo.
echo If the app works now, the issue is confirmed to be with Tailwind CSS v4.
echo Press Ctrl+C to stop the server, then run "restore-main-tsx.bat" to restore original.
echo.
call pnpm dev