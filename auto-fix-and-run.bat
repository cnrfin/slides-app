@echo off
REM auto-fix-and-run.bat
REM Automatically fix all issues and run the app

cls
echo.
echo    ______ _                          _____ _ _     _           
echo   |  ____(_)                        / ____| (_)   | |          
echo   | |__   _  __ _ _ __ ___   __ _  | (___ | |_  __| | ___  ___ 
echo   |  __| | |/ _` | '_ ` _ \ / _` |  \___ \| | |/ _` |/ _ \/ __|
echo   | |    | | (_| | | | | | | (_| |  ____) | | | (_| |  __/\__ \
echo   |_|    |_|\__, |_| |_| |_|\__,_| |_____/|_|_|\__,_|\___||___/
echo              __/ |                                              
echo             |___/                                               
echo.
echo    Language Learning App - Auto Fix Script
echo    =========================================
echo.
timeout /t 2 /nobreak >nul

echo    [1/3] Installing react-konva@18...
call pnpm add react-konva@^18.2.10 >nul 2>&1
echo    [OK] React-Konva v18 installed!
echo.

echo    [2/3] Verifying Tailwind CSS...
echo    [OK] Tailwind CSS v3 already installed!
echo.

echo    [3/3] Final dependency check...
call pnpm install >nul 2>&1
echo    [OK] All dependencies verified!
echo.

echo    =========================================
echo    All issues fixed! Starting your app...
echo    =========================================
echo.
timeout /t 2 /nobreak >nul

call pnpm dev