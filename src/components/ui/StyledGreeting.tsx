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
  // "Good morning Connor" -> prefix: "Good morning ", name: "Connor", suffix: ""
  // "Good morning, Connor" -> prefix: "Good morning, ", name: "Connor", suffix: ""
  // "Good afternoon コナー" -> prefix: "Good afternoon ", name: "コナー", suffix: ""
  // "おはよう、Connor" -> prefix: "おはよう、", name: "Connor", suffix: ""
  // "Connor さん、おはようございます" -> prefix: "", name: "Connor", suffix: " さん、おはようございます"
  // "早上好，康纳" -> prefix: "早上好，", name: "康纳", suffix: ""
  
  // First, check if there's a comma separator
  const lastCommaIndex = Math.max(
    greeting.lastIndexOf(','),
    greeting.lastIndexOf('，'),
    greeting.lastIndexOf('、')
  );
  
  if (lastCommaIndex !== -1) {
    // Found a comma, name is likely after it
    const prefix = greeting.substring(0, lastCommaIndex + 1);
    const afterComma = greeting.substring(lastCommaIndex + 1).trim();
    
    // Check if there's more text after the name (like Japanese honorifics)
    const particleMatch = afterComma.match(/^([^さんくん様君ちゃん]+)(さん|くん|様|君|ちゃん)?(.*)$/);
    
    if (particleMatch && particleMatch[1]) {
      return {
        prefix: prefix + ' ',
        name: particleMatch[1],
        suffix: (particleMatch[2] || '') + (particleMatch[3] || '')
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
  
  // No comma found - look for patterns without comma
  // Pattern: English greeting followed by name (last word or CJK characters)
  // "Good morning Connor" or "Good afternoon コナー"
  
  // Split by spaces to find the last word/segment
  const words = greeting.split(' ');
  
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    
    // Check if the last word looks like a name
    // It's a name if it:
    // 1. Starts with a capital letter (English name)
    // 2. Contains CJK characters
    // 3. Is preceded by common greeting words
    const isLikelyName = 
      /^[A-Z]/.test(lastWord) || // Starts with capital
      containsCJK(lastWord);      // Contains CJK
    
    // Check if preceding words are common greeting phrases
    const precedingWords = words.slice(0, -1).join(' ').toLowerCase();
    const isGreetingPhrase = 
      precedingWords.includes('good morning') ||
      precedingWords.includes('good afternoon') ||
      precedingWords.includes('good evening') ||
      precedingWords.includes('hello') ||
      precedingWords.includes('hi');
    
    if (isLikelyName || isGreetingPhrase) {
      return {
        prefix: words.slice(0, -1).join(' ') + ' ',
        name: lastWord,
        suffix: ''
      };
    }
  }
  
  // Pattern: Look for standalone English name in CJK text
  const englishNameMatch = greeting.match(/\b([A-Z][a-z]+)\b/);
  if (englishNameMatch) {
    const nameIndex = greeting.indexOf(englishNameMatch[0]);
    return {
      prefix: greeting.substring(0, nameIndex),
      name: englishNameMatch[0],
      suffix: greeting.substring(nameIndex + englishNameMatch[0].length)
    };
  }
  
  // No clear name found, return as is
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