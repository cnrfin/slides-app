# Text Issues Analysis and Solutions

## Issue 1: Text Background
Looking at your screenshots, the blue highlighting appears to be browser text selection, not a background color on the text element. This can happen when:
- The text is being selected in the textarea during editing
- Browser selection styles are showing through

## Issue 2: Text Dimension Mismatch
The text is being cut off because of width constraints. Here's what's happening:
1. In edit mode: Text expands naturally (no width constraint)
2. In display mode: Text was being constrained by stored width
3. Result: Text wraps and gets cut off

## Solutions Implemented

### 1. **Removed Width Constraints**
- Text now renders at natural width in display mode
- No more text wrapping or cutoff
- Matches edit mode behavior

### 2. **Custom Hit Detection**
- Added custom hitFunc to match visual bounds
- Ensures click detection matches what you see

### 3. **Transparent Backgrounds**
- All selection/hover rectangles use `fill="transparent"`
- No background on text elements

## Remaining Considerations

### Browser Selection Highlighting
If you're seeing blue selection highlights, this might be from:
- Text being selected in the textarea
- Browser's default selection behavior

### To Test
1. Add text element
2. Type long text without line breaks
3. Click outside to save
4. Text should display fully without wrapping
5. No background should be visible

## Next Steps
If you're still seeing a background:
1. Check browser dev tools for any CSS affecting the canvas
2. Verify no other elements are rendering behind the text
3. Check if the blue is actually browser text selection