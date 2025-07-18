@echo off
REM test-app.bat
REM Quick test of the app after fixes

echo ========================================
echo Testing Figma Slides App
echo ========================================
echo.
echo Making sure all dependencies are installed...
call pnpm install

echo.
echo Starting development server...
echo.
echo The app should now have:
echo - Fixed canvas dimensions (800x600)
echo - Smooth dragging for all elements
echo - Pan mode with Space + drag
echo - Zoom with mouse wheel
echo - Keyboard shortcuts (Delete, Ctrl+A, etc.)
echo.
call pnpm dev