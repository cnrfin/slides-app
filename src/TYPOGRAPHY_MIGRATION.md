# Typography Migration Guide

## Quick Reference: Class Replacements

### Headings (Now use Martina Plantijn)
- `text-3xl font-bold` → `text-h1`
- `text-2xl font-semibold` → `text-h2`
- `text-xl font-semibold` → `text-h3` or `text-h4`
- `text-lg font-semibold` → `text-h4` or `text-h5`
- `text-base font-semibold` → `text-h6`

### Body Text (Uses Inter)
- `text-lg` → `text-body-large`
- `text-base` → `text-body`
- `text-sm` → `text-body-small`
- `text-xs` → `text-caption`

### UI Elements
- Button text: `text-sm font-medium` → `text-button`
- Labels: `text-xs` → `text-label`
- Menu items: `text-sm` → `text-menu`

## Components to Migrate (Priority Order)

### ✅ Already Updated:
- [x] DashboardLayout.tsx
- [x] Sidebar.tsx

### High Priority (Most Visible):
- [ ] DashboardHome.tsx
- [ ] Modal.tsx
- [ ] TextPropertiesPanel.tsx
- [ ] RightSidebar.tsx

### Medium Priority:
- [ ] SettingsPage.tsx
- [ ] BillingPage.tsx
- [ ] LessonsPage.tsx
- [ ] StudentsPage.tsx
- [ ] UserMenu.tsx

### Low Priority:
- [ ] All popup components
- [ ] All property panels
- [ ] Toast notifications
- [ ] Form components

## How to Test Changes

1. Start your dev server
2. Check that headings appear in Martina Plantijn (serif font)
3. Check that body text appears in Inter (sans-serif)
4. Verify font sizes look proportional

## To Change Font Sizes Globally

Edit `/src/styles/globals.css`:

```css
/* Make all headings bigger */
--text-h1: 3rem;     /* was 2.5rem */
--text-h2: 2.5rem;   /* was 2rem */

/* Make body text smaller */
--text-body: 0.9rem; /* was 1rem */
```

## Common Patterns

### Dashboard Cards
```tsx
// Before
<h3 className="text-lg font-semibold">Card Title</h3>
<p className="text-sm text-gray-600">Description</p>

// After
<h3 className="text-h5">Card Title</h3>
<p className="text-body-small text-gray-600">Description</p>
```

### Modal Headers
```tsx
// Before
<h2 className="text-xl font-semibold">Modal Title</h2>

// After
<h2 className="text-h4">Modal Title</h2>
```

### Form Fields
```tsx
// Before
<label className="text-xs text-gray-600">Field Label</label>
<input className="text-sm" />

// After
<label className="text-label text-gray-600">Field Label</label>
<input className="text-body-small" />
```

## Tips
- Keep color classes (like `text-gray-600`) - only replace size/weight classes
- Font weight modifiers still work: `text-body font-semibold`
- The system is backward compatible - old classes still work while migrating
