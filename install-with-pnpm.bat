@echo off
echo Installing dependencies with pnpm...

echo Checking if pnpm is installed...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pnpm is not installed. Installing pnpm globally...
    call npm install -g pnpm
)

echo Installing project dependencies...
call pnpm install

echo Installation complete!
echo You can now run the app with: pnpm run dev
pause
