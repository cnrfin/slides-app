@echo off
REM restore-main-tsx.bat
REM Restore original main.tsx after testing

echo Restoring original main.tsx...
copy /Y src\main.tsx.backup src\main.tsx
del src\main.tsx.backup

echo.
echo Original main.tsx restored!
echo.
echo Now run "switch-to-tailwind-v3-now.bat" to fix Tailwind CSS.
pause