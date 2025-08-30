# Drop Shadow Spread, Blur Opacity, and Border Rendering Fixes

## Issues Fixed

1. **Drop Shadow Spread Property Not Rendering**
   - The `spread` property in drop shadows was not being applied on the canvas
   - Elements with shadow spread (text, image, blurb, icon, shapes) were not showing the spread effect

2. **Opacity with Blur Causing White Color**
   - When applying opacity to elements with blur, the elements were becoming transparent white instead of maintaining their original color with opacity

3. **Border Affected by Blur**
   - When blur was applied to elements, the border was also getting blurred
   - Borders should remain sharp even when the element itself is blurred

4. **Rendering Consistency**
   - Fixes needed to work across all three rendering contexts:
     - Canvas (main editor)
     - Canvas Preview (slide preview)
     - PDF Export

## Solution Implementation

### 1. Created Shadow Utilities (`src/utils/shadow.utils.ts`)

New utility functions for consistent shadow handling:

- **`hexToRgba(hex, opacity)`**: Convert hex colors to RGBA format
- **`getKonvaShadowProps(dropShadow)`**: Get Konva-compatible shadow props with spread simulation
- **`getCSSBoxShadow(dropShadow)`**: Get CSS box-shadow string for HTML rendering
- **`applyCanvasShadow(ctx, dropShadow)`**: Apply shadow to Canvas 2D context with spread simulation
- **`getShadowShapeProps(element, dropShadow)`**: Create shadow shape props for spread simulation

**Key Innovation**: Since Konva doesn't natively support `shadowSpread`, we simulate it by:
1. Adjusting the blur radius: `effectiveBlur = blur + |spread|`
2. For more accurate spread rendering, creating a separate shadow shape behind the element

### 2. Updated ElementRenderer (`src/components/canvas/ElementRenderer.tsx`)

#### Shadow Spread Handling:
- Import and use new shadow utilities
- Check if element has shadow spread that needs special handling
- Render a separate shadow shape behind elements when spread is needed
- Apply shadow props conditionally based on spread presence

#### Blur and Opacity Fix:
- Modified caching configuration to exclude borders from cached image
- Apply `globalCompositeOperation: 'source-over'` when caching to preserve colors
- Ensure opacity is applied to colors directly, not to the cached result

#### Border Separation:
- Added logic to detect when borders need separate rendering
- When blur is applied and element has a border:
  - Render the main shape without stroke
  - Render a separate non-cached rect with just the border
  - This keeps the border sharp while the fill is blurred

### 3. Updated PDF Export (`src/utils/pdf-export.ts`)

- Import and use `applyCanvasShadow` from shadow utilities
- Simplified shadow application using the centralized utility
- Ensures consistent shadow rendering with spread simulation in PDF exports

### 4. Updated SlidePreview (`src/components/previews/SlidePreview.tsx`)

- Import shadow utilities for consistent shadow handling
- Replace custom shadow string generation with `getScaledShadowProps`
- Apply scaled shadow props to preview elements
- Ensures preview accurately reflects the main canvas rendering

### 5. Test File (`src/test/test-shadow-spread-blur.tsx`)

Created comprehensive test file demonstrating:
- Shadow with spread property
- Blur with opacity maintaining color
- Blur with sharp borders
- All effects combined

## Technical Details

### Shadow Spread Simulation

Konva.js doesn't have a native `shadowSpread` property like CSS. We simulate it by:

1. **Blur Adjustment**: Adding the absolute value of spread to the blur radius
2. **Shadow Shape**: For more accurate rendering, creating a duplicate shape behind the element with:
   - Position offset by shadow offset minus spread
   - Size increased by spread * 2
   - Fill color set to shadow color with opacity
   - Optional blur applied

### Color Preservation with Blur

When applying blur with Konva filters:
1. Cache the element for filter application
2. Apply opacity to the fill color directly before caching
3. Use `globalCompositeOperation: 'source-over'` to prevent color washing
4. Maintain separate opacity values for fill and border

### Border Separation Strategy

To keep borders sharp when blur is applied:
1. Detect when both blur and border are present
2. Render main shape without stroke
3. Apply blur filter to the cached main shape
4. Render a separate, non-cached shape with only the stroke
5. Position the border shape exactly over the blurred element

## Usage Example

```tsx
// Element with all fixes applied
const element = {
  type: 'shape',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  opacity: 0.8,
  style: {
    backgroundColor: '#3b82f6',
    fillOpacity: 0.7,
    borderColor: '#1e40af',
    borderWidth: 3,
    borderOpacity: 1,
    borderRadius: 20,
    blur: 10,
    dropShadow: {
      enabled: true,
      offsetX: 10,
      offsetY: 10,
      blur: 15,
      spread: 5, // Now renders correctly!
      color: '#000000',
      opacity: 0.3
    }
  }
}
```

## Affected Components

- ✅ `ElementRenderer.tsx` - Main canvas rendering
- ✅ `SlidePreview.tsx` - Preview rendering
- ✅ `pdf-export.ts` - PDF export functionality
- ✅ `EffectsControls.tsx` - UI controls for effects
- ✅ `shadow.utils.ts` - New utility file for shadow handling
- ✅ `slide.types.ts` - Type definitions (already had spread property)

## Testing

Run the test file to verify all fixes:
1. Navigate to the test component in your app
2. Verify each test element renders correctly:
   - Element 1: Shadow with visible spread
   - Element 2: Blurred red element (not white)
   - Element 3: Blurred element with sharp border
   - Element 4: All effects working together

## Performance Considerations

- Caching is only applied when blur is present
- Shadow spread shapes are only created when spread value is non-zero
- Border separation only occurs when both blur and border are present
- All optimizations maintain visual quality while minimizing performance impact

## Browser Compatibility

- Uses standard Canvas 2D API for PDF export
- Konva.js handles cross-browser compatibility for canvas rendering
- CSS box-shadow fallback available for HTML-based previews
- No browser-specific hacks required

## Future Enhancements

1. **Inset Shadows**: Add support for inner shadows
2. **Multiple Shadows**: Support multiple drop shadows on a single element
3. **Shadow Blur Quality**: Add quality settings for shadow rendering
4. **Performance Monitoring**: Add metrics for render performance with effects
