# Font Weight Availability System

## Overview
Implemented a smart font weight availability system that dynamically enables/disables weight options based on the selected font, ensuring users can only select weights that are actually available for each font.

## Features

### 1. **Font Weight Configuration**
Each font now includes an array of available weights:
- System fonts (Arial, Georgia, etc.): Usually support 400 (Regular) and 700 (Bold)
- Web fonts (Inter, Poppins, etc.): Support wider range from 100 (Thin) to 900 (Black)
- Special fonts (Impact): Only support specific weights

### 2. **Dynamic Weight Dropdown**
- Weight options automatically update based on selected font
- Unavailable weights are:
  - Disabled (unclickable)
  - Visually greyed out
  - Marked with "(unavailable)" text

### 3. **Automatic Weight Adjustment**
When switching fonts:
- If current weight is available in new font → keeps it
- If current weight is unavailable → automatically selects closest available weight
- Example: If Bold (700) selected in Inter, switching to Impact (which only has 400) automatically changes to Regular

### 4. **Enhanced Font List**
Added popular web fonts with extensive weight support:
- **Inter**: All 9 weights (100-900)
- **Roboto**: 6 weights (100, 300, 400, 500, 700, 900)
- **Open Sans**: 6 weights (300-800)
- **Montserrat**: All 9 weights (100-900)
- **Poppins**: All 9 weights (100-900)
- **Playfair Display**: 6 weights (400-900)
- **Merriweather**: 4 weights (300, 400, 700, 900)

## Technical Implementation

### Files Modified:
1. **`src/utils/fonts.config.ts`**
   - Added weight arrays to each font
   - Helper functions: `getAvailableWeights()`, `isWeightAvailable()`, `getClosestAvailableWeight()`

2. **`src/components/properties/TextPropertiesPanel.tsx`**
   - Dynamic weight dropdown with availability checking
   - Auto-adjustment when changing fonts

3. **`src/components/properties/BlurbPropertiesPanel.tsx`**
   - Same weight management as TextPropertiesPanel

4. **`index.html`**
   - Added Google Fonts links for all web fonts with their weight variations

5. **`src/styles/globals.css`**
   - Added styles for disabled select options

## User Experience
- **Predictable**: Users can see which weights are available before selecting
- **Smart**: Automatically adjusts to closest weight when switching fonts
- **Visual Feedback**: Clear indication of unavailable options
- **No Errors**: Prevents selection of unsupported font weights

## Example Workflow
1. User selects "Poppins" font → sees all 9 weight options
2. User sets weight to "Extra Light (200)"
3. User switches to "Arial" → weight automatically changes to "Regular (400)" (closest available)
4. Weight dropdown now shows only "Regular" and "Bold" as available options
