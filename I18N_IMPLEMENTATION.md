# Multi-Language Support Implementation

## Overview
This project now includes comprehensive multi-language support using `react-i18next` with support for 6 languages:
- English (en) 🇬🇧
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Japanese (ja) 🇯🇵
- Chinese Simplified (zh) 🇨🇳

## Implementation Status ✅

### Completed Components
- [x] i18n configuration (`src/i18n/config.ts`)
- [x] Language store with Zustand (`src/stores/languageStore.ts`)
- [x] Language selector popup component (`src/components/language/LanguagePopup.tsx`)
- [x] Language selector component (`src/components/language/LanguageSelector.tsx`)
- [x] Updated UserMenu with language support (`src/components/auth/UserMenu.tsx`)
- [x] Translation files for all 6 languages
- [x] Font support for CJK languages
- [x] Utility functions for text handling
- [x] Test component for verification

### Directory Structure
```
src/
├── i18n/
│   ├── config.ts              # Main i18n configuration
│   ├── index.ts               # Exports
│   └── locales/
│       ├── en/               # English translations
│       ├── es/               # Spanish translations
│       ├── fr/               # French translations
│       ├── de/               # German translations
│       ├── ja/               # Japanese translations
│       └── zh/               # Chinese translations
├── components/
│   └── language/
│       ├── LanguagePopup.tsx    # Language selection popup
│       ├── LanguageSelector.tsx # Language selector button
│       └── index.ts
├── stores/
│   └── languageStore.ts      # Language state management
├── hooks/
│   └── useTypedTranslation.ts # Typed translation hook
└── utils/
    ├── fontLoader.ts         # Dynamic font loading
    └── textUtils.ts          # Text utilities for i18n
```

## Usage

### Basic Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Using Multiple Namespaces

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['common', 'auth']);
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <button>{t('auth:signIn')}</button>
    </div>
  );
}
```

### Using the Language Selector

```typescript
import { LanguageSelector } from '@/components/language';

function Header() {
  return (
    <header>
      <LanguageSelector showLabel={true} />
    </header>
  );
}
```

### Accessing Current Language

```typescript
import useLanguageStore from '@/stores/languageStore';

function MyComponent() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  
  return <p>Current language: {currentLanguage}</p>;
}
```

## Translation Files

Each language has 4 namespace files:
- `common.json` - Common UI elements and general terms
- `auth.json` - Authentication related text
- `slides.json` - Slide editor specific text
- `dashboard.json` - Dashboard and admin text

### Adding New Translations

1. Add the key-value pair to the English file first
2. Add corresponding translations to all other language files
3. Use the translation in your component with `t('namespace:key')`

Example:
```json
// en/common.json
{
  "newFeature": "New Feature"
}

// es/common.json
{
  "newFeature": "Nueva Función"
}
```

## Features

### Language Persistence
- Language preference is saved to localStorage
- Automatically restored on next visit
- Synced across all components via Zustand store

### Font Support
- Automatic font loading for CJK languages
- Optimized Google Fonts integration
- Proper fallback font stacks

### Text Utilities
- `detectScriptType()` - Detects Latin, CJK, or mixed text
- `getAdjustedFontSize()` - Adjusts font size for CJK readability
- `getTextExpansionFactor()` - Calculates text expansion for different languages
- `formatNumber()` - Locale-aware number formatting
- `formatDate()` - Locale-aware date formatting

### Browser Language Detection
Detection order:
1. localStorage (user preference)
2. Cookie
3. Browser navigator language
4. HTML lang attribute

## Performance Optimizations

### Font Loading
- CJK fonts are loaded on-demand
- Preload hints for better performance
- Font-display: swap to prevent FOIT

### Bundle Size
- Translation files are bundled per language
- Tree-shaking friendly implementation
- Lazy loading capability (can be enabled)

## Testing

### Test Component
A test component is available at `src/components/I18nTestComponent.tsx` to verify the implementation:

```typescript
import I18nTestComponent from '@/components/I18nTestComponent';

// Add to your route or page to test
<I18nTestComponent />
```

### Manual Testing Checklist
- [ ] Language selector opens and displays all 6 languages
- [ ] Selecting a language updates all text immediately
- [ ] Language preference persists after page reload
- [ ] CJK fonts display correctly
- [ ] UserMenu shows language selector
- [ ] All namespaces load correctly

## Next Steps for Full Implementation

### Components to Update
1. **Dashboard Components**
   - Update all dashboard text to use translations
   - Replace hardcoded strings with `t()` calls

2. **Slide Editor**
   - Translate toolbar items
   - Translate property panels
   - Translate context menus

3. **Templates**
   - Translate template names and descriptions
   - Localize default template content

4. **Error Messages**
   - Create error namespace
   - Translate all error messages

5. **Forms**
   - Translate form labels
   - Translate validation messages
   - Translate placeholders

### Additional Considerations

1. **Date/Time Formatting**
   ```typescript
   import { formatDate } from '@/utils/textUtils';
   
   const formattedDate = formatDate(new Date(), currentLanguage);
   ```

2. **Number Formatting**
   ```typescript
   import { formatNumber } from '@/utils/textUtils';
   
   const formattedNumber = formatNumber(1234567.89, currentLanguage);
   ```

3. **RTL Support (Future)**
   - Add Arabic or Hebrew support
   - Implement RTL layout switching
   - Mirror UI components

4. **Pluralization**
   ```json
   {
     "items_one": "{{count}} item",
     "items_other": "{{count}} items"
   }
   ```
   
   ```typescript
   t('items', { count: 5 }) // "5 items"
   ```

## Troubleshooting

### Common Issues

1. **Translations not updating**
   - Check namespace is loaded: `useTranslation(['namespace'])`
   - Verify translation key exists in JSON file
   - Check for typos in translation keys

2. **CJK fonts not displaying**
   - Ensure Google Fonts CDN is accessible
   - Check browser console for font loading errors
   - Verify CSS font-family declarations

3. **Language not persisting**
   - Check localStorage is enabled
   - Verify Zustand persist middleware is working
   - Check for localStorage quota exceeded

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Google Fonts](https://fonts.google.com/)

## Contributing

When adding new features:
1. Always add English translations first
2. Use translation keys that are descriptive
3. Group related translations in appropriate namespaces
4. Test with at least one CJK language
5. Consider text expansion for UI layout

## License

This implementation follows the project's existing license.
