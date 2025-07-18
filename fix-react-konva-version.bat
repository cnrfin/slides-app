@echo off
REM fix-react-konva-version.bat
REM Fix React-Konva version compatibility

echo ========================================
echo Fixing React-Konva Version Compatibility
echo ========================================
echo.
echo React-Konva v19 requires React v19, but we're using React v18.
echo We need to downgrade to React-Konva v18.
echo.

echo Removing current react-konva...
call pnpm remove react-konva

echo.
echo Installing compatible react-konva v18...
call pnpm add react-konva@^18.2.10

echo.
echo Done! React-Konva v18 is now installed and compatible with React 18.
echo.
echo You can now run "pnpm dev" to start the development server.
pause