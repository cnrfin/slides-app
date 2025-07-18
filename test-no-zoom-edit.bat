@echo off
echo Testing: Canvas Controls During Text Edit
echo =========================================
echo.
echo This test verifies that zoom and pan are disabled while editing text
echo.
echo TEST STEPS:
echo.
echo 1. Add a text element
echo 2. Double-click to start editing
echo 3. Notice the AMBER banner: "Text Edit Mode - Zoom/Pan Disabled"
echo.
echo 4. TRY THESE (should NOT work during edit):
echo    - Scroll mouse wheel (zoom disabled)
echo    - Hold Space + drag (pan disabled)
echo    - Canvas should stay still
echo.
echo 5. Click outside to save text
echo 6. NOW try zoom/pan - should work again!
echo.
echo Expected behavior:
echo - During edit: NO zoom, NO pan
echo - After edit: zoom and pan work normally
echo.
echo Press any key to start testing...
pause > nul

npm run dev