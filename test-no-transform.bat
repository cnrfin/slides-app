@echo off
echo Testing: No Transform Handles
echo =============================
echo.
echo This test verifies that resize and rotate handles are removed from ALL elements
echo.
echo What to test:
echo 1. Add a text element - should only show selection border
echo 2. Add a rectangle - should only show selection border
echo 3. Add a circle - should only show selection border
echo.
echo Expected behavior:
echo - NO resize handles (corner/edge squares)
echo - NO rotation handle (circle above element)
echo - Only blue selection border when selected
echo - Elements can be dragged to move
echo.
echo Press any key to start the app...
pause > nul

npm run dev