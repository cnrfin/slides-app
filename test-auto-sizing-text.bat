@echo off
echo Testing Auto-Sizing Text Feature...
echo.
echo Starting the application with auto-sizing text elements
echo.
echo Test Instructions:
echo 1. Click "Add Text" to create a new text element
echo 2. Double-click the text to edit it
echo 3. Type some text and press Enter to create multiple lines
echo 4. Click outside to save (text will auto-size to content)
echo 5. Try adding more text - it should expand automatically
echo.
echo Press any key to start the app...
pause > nul

npm run dev
