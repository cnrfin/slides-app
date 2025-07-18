# fix-all-issues.ps1
# Fix both Tailwind CSS and React-Konva compatibility issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing All Compatibility Issues" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will fix:" -ForegroundColor Yellow
Write-Host "1. Tailwind CSS v4 to v3 (for stability)" -ForegroundColor Yellow
Write-Host "2. React-Konva v19 to v18 (for React 18 compatibility)" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "Step 1: Fixing Tailwind CSS..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography @tailwindcss/postcss
pnpm add -D tailwindcss@^3.4.0 autoprefixer postcss
pnpm add -D @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10

Write-Host ""
Write-Host "Step 2: Fixing React-Konva..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
pnpm remove react-konva
pnpm add react-konva@^18.2.10

Write-Host ""
Write-Host "Step 3: Ensuring all peer dependencies are correct..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
pnpm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All issues fixed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app should now work with:" -ForegroundColor Yellow
Write-Host "- Tailwind CSS v3 (stable)" -ForegroundColor White
Write-Host "- React-Konva v18 (compatible with React 18)" -ForegroundColor White
Write-Host ""
Write-Host "Run 'pnpm dev' to start the development server." -ForegroundColor Green
Read-Host "Press Enter to exit"