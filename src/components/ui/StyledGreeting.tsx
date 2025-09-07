// src/components/ui/StyledGreeting.tsx
import React from 'react';

interface StyledGreetingProps {
  greeting: string;
  className?: string;
}

/**
 * Detects if a string contains CJK (Chinese, Japanese, Korean) characters
 */
function containsCJK(text: string): boolean {
  // Unicode ranges for CJK characters
  const cjkRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\uAC00-\uD7AF]/;
  return cjkRegex.test(text);
}

/**
 * Splits a greeting string to identify the name portion
 * Assumes the name is the last word/phrase after a comma or the last word
 */
function parseGreeting(greeting: string): { prefix: string; name: string; suffix: string } {
  // Common greeting patterns:
  // "Good morning, Connor" -> prefix: "Good morning, ", name: "Connor", suffix: ""
  // "おはよう、Connor" -> prefix: "おはよう、", name: "Connor", suffix: ""
  // "Connor さん、おはようございます" -> prefix: "", name: "Connor", suffix: " さん、おはようございます"
  // "早上好，康纳" -> prefix: "早上好，", name: "康纳", suffix: ""
  
  // Try to find name patterns
  // Pattern 1: Name after last comma (most common in translations)
  const lastCommaIndex = greeting.lastIndexOf('，') !== -1 ? greeting.lastIndexOf('，') : greeting.lastIndexOf(',');
  const lastCommaJpIndex = greeting.lastIndexOf('、');
  
  let splitIndex = Math.max(lastCommaIndex, lastCommaJpIndex);
  
  if (splitIndex !== -1) {
    // Found a comma, name is likely after it
    const prefix = greeting.substring(0, splitIndex + 1);
    const afterComma = greeting.substring(splitIndex + 1).trim();
    
    // Check if there's more text after the name (like Japanese honorifics)
    // Look for space or Japanese particles that might follow a name
    const particleMatch = afterComma.match(/^([^さんくん様君ちゃん]+)(さん|くん|様|君|ちゃん)?(.*)$/);
    const spaceMatch = afterComma.match(/^(\S+)\s+(.+)$/);
    
    if (particleMatch && particleMatch[1]) {
      return {
        prefix: prefix + ' ',
        name: particleMatch[1],
        suffix: (particleMatch[2] || '') + (particleMatch[3] || '')
      };
    } else if (spaceMatch && !containsCJK(spaceMatch[1])) {
      // If the first word after comma is non-CJK, it's likely the name
      return {
        prefix: prefix + ' ',
        name: spaceMatch[1],
        suffix: ' ' + spaceMatch[2]
      };
    } else {
      // Assume everything after comma is the name
      return {
        prefix: prefix + ' ',
        name: afterComma,
        suffix: ''
      };
    }
  }
  
  // Pattern 2: Look for standalone English name in CJK text
  const englishNameMatch = greeting.match(/\b([A-Z][a-z]+)\b/);
  if (englishNameMatch) {
    const nameIndex = greeting.indexOf(englishNameMatch[0]);
    return {
      prefix: greeting.substring(0, nameIndex),
      name: englishNameMatch[0],
      suffix: greeting.substring(nameIndex + englishNameMatch[0].length)
    };
  }
  
  // Pattern 3: No clear name found, return as is
  return {
    prefix: greeting,
    name: '',
    suffix: ''
  };
}

/**
 * A styled greeting component that applies different fonts to different parts
 * - CJK text uses Noto Sans fonts with regular weight (400)
 * - Latin names use Martina Plantijn for brand identity
 */
export default function StyledGreeting({ greeting, className = '' }: StyledGreetingProps) {
  const { prefix, name, suffix } = parseGreeting(greeting);
  const nameIsCJK = containsCJK(name);
  
  // Base classes for the h1 element (without font-family which we'll override)
  const baseClasses = `text-h1 text-gray-800 dark:text-dark-heading mb-2 animate-greeting ${className}`;
  
  return (
    <h1 className={baseClasses}>
      {prefix && (
        <span
          style={{
            fontFamily: containsCJK(prefix) 
              ? "'Noto Sans SC', 'Noto Sans JP', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
              : "'Martina Plantijn', 'Georgia', serif",
            fontWeight: containsCJK(prefix) ? 400 : 300  // Changed from 500 to 400
          }}
        >
          {prefix}
        </span>
      )}
      {name && (
        <span
          style={{
            fontFamily: nameIsCJK
              ? "'Noto Sans SC', 'Noto Sans JP', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
              : "'Martina Plantijn', 'Georgia', serif",
            fontWeight: nameIsCJK ? 400 : 300,  // Changed from 500 to 400
            // Slightly emphasize the name
            fontStyle: nameIsCJK ? 'normal' : 'normal'
          }}
        >
          {name}
        </span>
      )}
      {suffix && (
        <span
          style={{
            fontFamily: containsCJK(suffix)
              ? "'Noto Sans SC', 'Noto Sans JP', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"
              : "'Martina Plantijn', 'Georgia', serif",
            fontWeight: containsCJK(suffix) ? 400 : 300  // Changed from 500 to 400
          }}
        >
          {suffix}
        </span>
      )}
    </h1>
  );
}

// Export utility functions for testing
export { containsCJK, parseGreeting };