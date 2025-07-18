@echo off
REM install-missing-deps.bat
REM Run this script to install missing PostCSS dependencies

echo Installing missing PostCSS dependencies...
call pnpm add -D autoprefixer postcss

echo Dependencies installed successfully!
echo You can now run "pnpm dev" to start the development server.
pause