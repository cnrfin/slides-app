// Font loading utility for lazy loading CJK fonts
export const loadLanguageFonts = async (language: string) => {
  // Create a link element to load the font dynamically
  const existingLink = document.querySelector(`link[data-lang="${language}"]`);
  
  if (existingLink) {
    return; // Font already loaded
  }
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-lang', language);
  
  if (language === 'ja') {
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap';
  } else if (language === 'zh') {
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';
  } else if (language === 'ko') {
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap';
  }
  
  if (link.href) {
    document.head.appendChild(link);
    
    // Wait for font to load
    await new Promise((resolve) => {
      link.onload = resolve;
      link.onerror = resolve; // Resolve even on error to not block
    });
  }
};

// Preload fonts for better performance
export const preloadFonts = (languages: string[]) => {
  languages.forEach(lang => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    
    if (lang === 'ja') {
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap';
    } else if (lang === 'zh') {
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap';
    } else if (lang === 'ko') {
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap';
    }
    
    if (link.href) {
      document.head.appendChild(link);
    }
  });
};
