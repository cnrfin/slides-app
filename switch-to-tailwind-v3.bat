@echo off
REM switch-to-tailwind-v3.bat
REM Switch to stable Tailwind CSS v3

echo Removing Tailwind CSS v4...
call pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography

echo Installing Tailwind CSS v3...
call pnpm add -D tailwindcss@^3.4.0 @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10

echo Updating PostCSS configuration...
echo Installation complete!
echo You can now run "pnpm dev" to start the development server.
pause