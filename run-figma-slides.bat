@echo off
REM run-figma-slides.bat
REM Complete Figma Slides App with all features

cls
echo.
echo    ╔═══════════════════════════════════════════════════════╗
echo    ║         FIGMA SLIDES - Language Learning Editor       ║
echo    ║                    Version 1.0                        ║
echo    ╚═══════════════════════════════════════════════════════╝
echo.
echo    ✨ FEATURES:
echo.
echo    📝 TEXT EDITING
echo       • Double-click any text to edit
echo       • Multi-line text with auto-resize
echo       • Word wrapping and scrolling
echo.
echo    🎨 CANVAS (800x600)
echo       • Smooth drag and drop
echo       • Professional styling
echo       • Constrained boundaries
echo.
echo    🔍 NAVIGATION
echo       • Space + Drag to pan
echo       • Mouse wheel to zoom (33%% - 200%%)
echo       • Visual indicators
echo.
echo    🎯 SELECTION
echo       • Click to select
echo       • Ctrl+Click for multi-select
echo       • Delete key to remove
echo.
echo    📊 SLIDES
echo       • Create, duplicate, delete
echo       • Thumbnail navigation
echo       • Slide counter
echo.
echo    ═══════════════════════════════════════════════════════
echo.

REM Quick dependency check
call pnpm list react-konva >nul 2>&1
if errorlevel 1 (
    echo    Installing dependencies...
    call pnpm add react-konva@^18.2.10
    echo.
)

echo    Starting application at http://localhost:5173
echo.
echo    Press Ctrl+C to stop the server
echo.
echo    ═══════════════════════════════════════════════════════
echo.
call pnpm dev