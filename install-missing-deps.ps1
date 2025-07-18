# install-missing-deps.ps1
# Run this script to install missing PostCSS dependencies

Write-Host "Installing missing PostCSS dependencies..." -ForegroundColor Green
pnpm add -D autoprefixer postcss

Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host "You can now run 'pnpm dev' to start the development server." -ForegroundColor Yellow
Read-Host "Press Enter to exit"