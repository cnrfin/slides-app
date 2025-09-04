/**
 * Detects the script type of the given text
 * @param text - The text to analyze
 * @returns The detected script type
 */
export const detectScriptType = (text: string): 'latin' | 'cjk' | 'mixed' => {
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
  const latinRegex = /[a-zA-Z]/;
  
  const hasCJK = cjkRegex.test(text);
  const hasLatin = latinRegex.test(text);
  
  if (hasCJK && hasLatin) return 'mixed';
  if (hasCJK) return 'cjk';
  return 'latin';
};

/**
 * Adjusts font size for CJK text in slides for better readability
 * @param baseFontSize - The base font size
 * @param language - The current language code
 * @returns The adjusted font size
 */
export const getAdjustedFontSize = (baseFontSize: number, language: string): number => {
  if (language === 'ja' || language === 'zh') {
    return baseFontSize * 0.95; // Slightly smaller for better readability
  }
  return baseFontSize;
};

/**
 * Gets text expansion factor for different languages
 * @param language - The language code
 * @returns The expansion factor
 */
export const getTextExpansionFactor = (language: string): number => {
  const expansionFactors: Record<string, number> = {
    'de': 1.35, // German text expands ~35%
    'fr': 1.15, // French text expands ~15%
    'es': 1.15, // Spanish text expands ~15%
    'ja': 1.1,  // Japanese text expands ~10%
    'zh': 0.7,  // Chinese text contracts ~30%
    'en': 1.0,  // English is baseline
  };
  
  return expansionFactors[language] || 1.0;
};

/**
 * Estimates character width for layout calculations
 * @param text - The text to measure
 * @param language - The language code
 * @returns Estimated width multiplier
 */
export const getCharacterWidthMultiplier = (language: string): number => {
  // CJK characters are typically wider
  if (language === 'ja' || language === 'zh' || language === 'ko') {
    return 1.8; // CJK characters are roughly 1.8x wider than Latin characters
  }
  return 1.0;
};

/**
 * Truncates text with proper ellipsis handling for different scripts
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @param language - The language code
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number, language: string): string => {
  if (text.length <= maxLength) return text;
  
  // For CJK languages, we can truncate more aggressively as characters convey more meaning
  const adjustedLength = language === 'ja' || language === 'zh' 
    ? Math.floor(maxLength * 0.8) 
    : maxLength - 3;
  
  return text.substring(0, adjustedLength) + '...';
};

/**
 * Formats numbers according to locale
 * @param number - The number to format
 * @param language - The language code
 * @returns Formatted number string
 */
export const formatNumber = (number: number, language: string): string => {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
  };
  
  const locale = localeMap[language] || 'en-US';
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Formats dates according to locale
 * @param date - The date to format
 * @param language - The language code
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date, 
  language: string, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'zh': 'zh-CN',
  };
  
  const locale = localeMap[language] || 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Validates if text contains only valid characters for a given language
 * @param text - The text to validate
 * @param language - The language code
 * @returns Whether the text is valid for the language
 */
export const isValidForLanguage = (text: string, language: string): boolean => {
  const patterns: Record<string, RegExp> = {
    'ja': /^[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\s\d\p{P}]+$/u,
    'zh': /^[\u4e00-\u9fff\u3400-\u4dbf\s\d\p{P}]+$/u,
    'ko': /^[\uac00-\ud7af\u1100-\u11ff\s\d\p{P}]+$/u,
  };
  
  const pattern = patterns[language];
  if (!pattern) return true; // No specific validation for other languages
  
  return pattern.test(text);
};
