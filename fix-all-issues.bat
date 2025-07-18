@echo off
REM fix-all-issues.bat
REM Fix both Tailwind CSS and React-Konva compatibility issues

echo ========================================
echo Fixing All Compatibility Issues
echo ========================================
echo.
echo This script will fix:
echo 1. Tailwind CSS v4 to v3 (for stability)
echo 2. React-Konva v19 to v18 (for React 18 compatibility)
echo.
pause

echo.
echo Step 1: Fixing Tailwind CSS...
echo ----------------------------------------
call pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography @tailwindcss/postcss
call pnpm add -D tailwindcss@^3.4.0 autoprefixer postcss
call pnpm add -D @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10

echo.
echo Step 2: Fixing React-Konva...
echo ----------------------------------------
call pnpm remove react-konva
call pnpm add react-konva@^18.2.10

echo.
echo Step 3: Ensuring all peer dependencies are correct...
echo ----------------------------------------
call pnpm install

echo.
echo ========================================
echo All issues fixed!
echo ========================================
echo.
echo Your app should now work with:
echo - Tailwind CSS v3 (stable)
echo - React-Konva v18 (compatible with React 18)
echo.
echo Run "pnpm dev" to start the development server.
pause