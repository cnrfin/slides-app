@echo off
REM quick-fix.bat
REM Quick fix for the react-konva issue

echo ========================================
echo Quick Fix for React-Konva
echo ========================================
echo.
echo Installing react-konva v18 (compatible with React 18)...
echo.

call pnpm add react-konva@^18.2.10

echo.
echo Done! React-Konva v18 is now installed.
echo.
echo Starting development server...
call pnpm dev