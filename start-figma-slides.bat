@echo off
REM start-figma-slides.bat
REM Complete startup script for Figma Slides App

cls
echo.
echo     _____ _                          _____ _ _     _           
echo    |  ___(_) __ _ _ __ ___   __ _  / ____| (_) __| | ___  ___ 
echo    ^| ^|_  ^| ^|/ _` ^| '_ ` _ \ / _` ^| (__   ^| ^| ^|/ _` ^|/ _ \/ __^|
echo    ^|  _^| ^| ^| (_^| ^| ^| ^| ^| ^| ^| (_^| ^|____) ^| ^| ^| (_^| ^|  __/\__ \
echo    ^|_^|   ^|_^|\__, ^|_^| ^|_^| ^|_^|\__,_^|_____/^|_^|_^|\__,_^|\___^|^|___/
echo             __/ ^|                                              
echo            ^|___/                                               
echo.
echo    Language Learning Slide Editor
echo    ================================
echo.
timeout /t 2 /nobreak >nul

echo    [*] Checking dependencies...
call pnpm list react-konva >nul 2>&1
if errorlevel 1 (
    echo    [!] Installing react-konva...
    call pnpm add react-konva@^18.2.10 >nul 2>&1
)

echo    [*] Verifying setup...
call pnpm install >nul 2>&1

echo.
echo    ================================
echo    Features Available:
echo    ================================
echo    
echo    CANVAS:
echo    - 800x600 professional canvas
echo    - Smooth drag and drop
echo    
echo    TEXT EDITING:
echo    - Double-click any text to edit
echo    - Enter to save, Escape to cancel
echo    
echo    NAVIGATION:
echo    - Space + Drag to pan canvas
echo    - Mouse wheel to zoom (33%% - 200%%)
echo    
echo    SELECTION:
echo    - Click to select elements
echo    - Ctrl + Click for multi-select
echo    - Delete key to remove selected
echo    
echo    ================================
echo.
echo    Starting application...
echo.
timeout /t 2 /nobreak >nul

call pnpm dev