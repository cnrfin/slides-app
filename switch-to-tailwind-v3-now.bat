@echo off
REM switch-to-tailwind-v3-now.bat
REM Emergency switch to Tailwind CSS v3

echo ========================================
echo Switching to Tailwind CSS v3...
echo ========================================
echo.

echo Step 1: Removing Tailwind CSS v4 and related packages...
call pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography @tailwindcss/postcss

echo.
echo Step 2: Installing Tailwind CSS v3...
call pnpm add -D tailwindcss@^3.4.0 autoprefixer postcss

echo.
echo Step 3: Installing Tailwind plugins for v3...
call pnpm add -D @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10

echo.
echo Done! Tailwind CSS v3 is now installed.
echo.
echo You can now run "pnpm dev" to start the development server.
pause