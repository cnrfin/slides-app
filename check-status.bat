@echo off
REM check-status.bat
REM Check the status of key dependencies

echo ========================================
echo Checking Dependency Status
echo ========================================
echo.

echo Checking React version...
call pnpm list react react-dom

echo.
echo Checking Konva versions...
call pnpm list konva react-konva

echo.
echo Checking Tailwind CSS version...
call pnpm list tailwindcss

echo.
echo ========================================
echo Expected versions:
echo - react: ^18.x.x
echo - react-konva: ^18.x.x (NOT v19)
echo - tailwindcss: ^3.x.x (NOT v4)
echo ========================================
echo.
pause