// src/components/ui/StyledGreetingTest.tsx
import React from 'react';
import StyledGreeting, { parseGreeting } from './StyledGreeting';

/**
 * Test component to verify StyledGreeting works with various languages
 */
export default function StyledGreetingTest() {
  const testGreetings = [
    // English
    "Good morning, Connor",
    "Good afternoon, Sarah",
    "Good evening, John",
    
    // Japanese
    "おはようございます、Connor",
    "こんにちは、Sarah さん",
    "Connorさん、おはようございます",
    "おはよう、田中",
    
    // Chinese
    "早上好，Connor",
    "下午好，李明",
    "晚上好，Sarah",
    "Connor，您好",
    
    // Spanish
    "Buenos días, Connor",
    "Buenas tardes, María",
    
    // French
    "Bonjour, Connor",
    "Bonsoir, Pierre",
    
    // German
    "Guten Morgen, Connor",
    "Guten Tag, Hans",
    
    // Italian
    "Buongiorno, Connor",
    "Buonasera, Giuseppe",
  ];
  
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">StyledGreeting Test Cases</h2>
      
      {testGreetings.map((greeting, index) => {
        const parsed = parseGreeting(greeting);
        return (
          <div key={index} className="border-b pb-4">
            <div className="mb-2">
              <StyledGreeting greeting={greeting} />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Original: "{greeting}"</div>
              <div>Prefix: "{parsed.prefix}"</div>
              <div>Name: "{parsed.name}" (font: {parsed.name && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(parsed.name) ? 'Noto Sans' : 'Martina Plantijn'})</div>
              <div>Suffix: "{parsed.suffix}"</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}