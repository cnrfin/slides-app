@echo off
REM test-multiline-text.bat
REM Test the multi-line text feature

echo ========================================
echo Testing Multi-line Text Feature
echo ========================================
echo.
echo The text editing now supports multiple lines!
echo.
echo Test Instructions:
echo 1. Click "Add Text" to create a text element
echo 2. Double-click the text to edit
echo 3. Type a long sentence that wraps to multiple lines
echo 4. Press Enter to save
echo.
echo The text element will automatically resize to show all lines.
echo.
echo Features:
echo - Text wraps automatically based on width
echo - Element height adjusts to fit all content
echo - Scrollbar appears for very long text
echo - Shift+Enter adds new lines manually
echo.
echo Starting app...
call pnpm dev