@echo off
REM fix-tailwind-complete.bat
REM Complete fix for Tailwind CSS issues

echo ========================================
echo Tailwind CSS Fix Options
echo ========================================
echo.
echo 1. Fix for Tailwind CSS v4 (install @tailwindcss/postcss)
echo 2. Switch to stable Tailwind CSS v3 (RECOMMENDED)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Installing Tailwind CSS v4 PostCSS plugin...
    call pnpm add -D @tailwindcss/postcss
    echo PostCSS config will use @tailwindcss/postcss
) else if "%choice%"=="2" (
    echo.
    echo Switching to Tailwind CSS v3...
    call pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography
    call pnpm add -D tailwindcss@^3.4.0 @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10
    
    REM Copy v3 PostCSS config
    copy /Y postcss.config.v3.js postcss.config.js
    
    echo Switched to Tailwind CSS v3!
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo Installation complete!
echo You can now run "pnpm dev" to start the development server.
pause