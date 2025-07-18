@echo off
REM run-app.bat
REM Complete setup and run script

echo ========================================
echo Figma Slides App - Complete Setup
echo ========================================
echo.

echo [1/4] Checking dependencies...
call pnpm list react-konva >nul 2>&1
if errorlevel 1 (
    echo Installing react-konva v18...
    call pnpm add react-konva@^18.2.10
) else (
    echo React-konva already installed.
)

echo.
echo [2/4] Verifying Tailwind CSS...
call pnpm list tailwindcss >nul 2>&1
if errorlevel 1 (
    echo Installing Tailwind CSS v3...
    call pnpm add -D tailwindcss@^3.4.0 autoprefixer postcss
) else (
    echo Tailwind CSS already installed.
)

echo.
echo [3/4] Installing any missing dependencies...
call pnpm install

echo.
echo [4/4] Starting development server...
echo.
echo ========================================
echo App Features:
echo - Canvas: 800x600 with smooth dragging
echo - Text Edit: DOUBLE-CLICK any text
echo - Pan: Hold SPACE + drag
echo - Zoom: Mouse wheel (33%% - 200%%)
echo - Delete: Select + DELETE key
echo - Multi-select: CTRL + click
echo ========================================
echo.
call pnpm dev