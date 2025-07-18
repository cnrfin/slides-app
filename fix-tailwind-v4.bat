@echo off
REM fix-tailwind-v4.bat
REM Fix Tailwind CSS v4 PostCSS integration

echo Installing Tailwind CSS v4 PostCSS plugin...
call pnpm add -D @tailwindcss/postcss

echo Installation complete!
echo Updating PostCSS configuration...
pause