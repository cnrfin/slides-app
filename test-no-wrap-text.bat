@echo off
echo Testing Text Auto-Sizing WITHOUT Wrapping...
echo.
echo The text should now:
echo - Expand horizontally as you type (no word wrapping)
echo - Only create new lines when you press Enter
echo - Be left-aligned
echo - Resize dynamically as you type
echo.
echo Test this by typing a long sentence without pressing Enter
echo.
echo Press any key to start the app...
pause > nul

npm run dev