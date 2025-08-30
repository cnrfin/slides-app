// src/utils/checkGoogleSetup.ts
// Diagnostic utility to check Google OAuth setup

export function checkGoogleSetup() {
  console.log('🔍 Checking Google OAuth Setup...\n');
  
  const issues: string[] = [];
  const warnings: string[] = [];
  const success: string[] = [];

  // Check environment variables
  console.log('📋 Environment Variables:');
  
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    issues.push('VITE_GOOGLE_CLIENT_ID is not set');
    console.error('❌ VITE_GOOGLE_CLIENT_ID: Missing');
  } else {
    success.push('VITE_GOOGLE_CLIENT_ID is configured');
    console.log('✅ VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  }

  if (!import.meta.env.VITE_GOOGLE_API_KEY) {
    warnings.push('VITE_GOOGLE_API_KEY is not set (optional but recommended)');
    console.warn('⚠️  VITE_GOOGLE_API_KEY: Not set (optional)');
  } else {
    success.push('VITE_GOOGLE_API_KEY is configured');
    console.log('✅ VITE_GOOGLE_API_KEY:', '***' + import.meta.env.VITE_GOOGLE_API_KEY.slice(-4));
  }

  if (!import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    warnings.push('VITE_GOOGLE_REDIRECT_URI is not set');
    console.warn('⚠️  VITE_GOOGLE_REDIRECT_URI: Using default');
  } else {
    success.push('VITE_GOOGLE_REDIRECT_URI is configured');
    console.log('✅ VITE_GOOGLE_REDIRECT_URI:', import.meta.env.VITE_GOOGLE_REDIRECT_URI);
  }

  // Check if Google scripts can be loaded
  console.log('\n📦 Google Scripts:');
  
  if (typeof window !== 'undefined') {
    if (window.google) {
      success.push('Google Identity Services is available');
      console.log('✅ Google Identity Services: Available');
    } else {
      console.log('⏳ Google Identity Services: Not loaded yet');
    }

    if (window.gapi) {
      success.push('Google API Client is available');
      console.log('✅ Google API Client: Available');
    } else {
      console.log('⏳ Google API Client: Not loaded yet');
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log('-------------------');
  
  if (issues.length > 0) {
    console.error('🚨 Critical Issues:', issues.length);
    issues.forEach(issue => console.error('  - ' + issue));
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:', warnings.length);
    warnings.forEach(warning => console.warn('  - ' + warning));
  }
  
  if (success.length > 0) {
    console.log('✅ Working:', success.length);
    success.forEach(item => console.log('  - ' + item));
  }

  // Recommendations
  if (issues.length > 0) {
    console.log('\n💡 Recommended Actions:');
    console.log('1. Add missing environment variables to .env.local');
    console.log('2. Get Google OAuth credentials from https://console.cloud.google.com');
    console.log('3. Enable Google Drive API in Google Cloud Console');
    console.log('4. Restart your development server after adding env vars');
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    warnings,
    success
  };
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Run check after a short delay to allow scripts to load
  setTimeout(() => {
    checkGoogleSetup();
  }, 2000);
}