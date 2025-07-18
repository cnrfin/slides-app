@echo off
echo Fixing npm installation issues...

echo Clearing npm cache...
call npm cache clean --force

echo Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo Removing lock files...
if exist package-lock.json del package-lock.json
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo Installing dependencies with npm...
call npm install

echo Installation complete!
pause
