# switch-to-tailwind-v3-now.ps1
# Emergency switch to Tailwind CSS v3

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Switching to Tailwind CSS v3..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Removing Tailwind CSS v4 and related packages..." -ForegroundColor Yellow
pnpm remove tailwindcss @tailwindcss/forms @tailwindcss/typography @tailwindcss/postcss

Write-Host ""
Write-Host "Step 2: Installing Tailwind CSS v3..." -ForegroundColor Yellow
pnpm add -D tailwindcss@^3.4.0 autoprefixer postcss

Write-Host ""
Write-Host "Step 3: Installing Tailwind plugins for v3..." -ForegroundColor Yellow
pnpm add -D @tailwindcss/forms@^0.5.7 @tailwindcss/typography@^0.5.10

Write-Host ""
Write-Host "Done! Tailwind CSS v3 is now installed." -ForegroundColor Green
Write-Host ""
Write-Host "You can now run 'pnpm dev' to start the development server." -ForegroundColor Green
Read-Host "Press Enter to exit"