@echo off
REM figma-slides.bat
REM Main launcher for Figma Slides App

cls
echo ========================================
echo Figma Slides - Language Learning Editor
echo ========================================
echo.
echo Starting application with all features:
echo.
echo [TEXT] Double-click to edit any text
echo       - Multi-line text supported!
echo       - Auto-resizing to fit content
echo [PAN]  Hold Space + drag to pan
echo [ZOOM] Mouse wheel to zoom in/out
echo [SAVE] Enter to save text, Esc to cancel
echo.
echo ========================================
echo.

REM Quick dependency check
call pnpm list react-konva >nul 2>&1
if errorlevel 1 (
    echo Installing missing dependencies...
    call pnpm add react-konva@^18.2.10
    echo.
)

echo Launching app at http://localhost:5173
echo.
call pnpm dev