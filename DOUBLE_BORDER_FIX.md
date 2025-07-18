# Fixed Double Border Issue

## Problem
When editing text, there were two visible borders:
1. The blue selection border from the canvas element
2. The blue border from the textarea editor
This created an overlapping double border appearance.

## Solution
Modified `ElementRenderer.tsx` to hide the selection border when text is being edited:
- Added `!isEditing` condition to all selection border renders
- This affects all three render cases:
  - Elements fully inside the slide
  - Elements partially outside the slide
  - Elements completely outside the slide

## Result
Now when editing text:
- ✅ Only the textarea border is visible (single blue border)
- ✅ Selection border is hidden during editing
- ✅ Clean, professional appearance
- ✅ No overlapping borders

When not editing:
- ✅ Selection border shows normally
- ✅ Hover effects work as expected
- ✅ All visual feedback remains intact