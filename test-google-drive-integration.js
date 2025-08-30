// Test script for Google Drive Integration
// Run this after setting up your Google Cloud credentials

import { googleDriveService } from './src/services/googleDrive';

async function testGoogleDriveIntegration() {
  console.log('🧪 Testing Google Drive Integration...\n');

  // Test 1: Check if environment variables are set
  console.log('1. Checking environment variables...');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  if (!clientId || clientId.includes('your_actual')) {
    console.error('❌ VITE_GOOGLE_CLIENT_ID not properly configured');
    console.log('   Please update your .env.local file with actual Google OAuth credentials');
    return false;
  }
  if (!clientSecret || clientSecret.includes('your_actual')) {
    console.error('❌ VITE_GOOGLE_CLIENT_SECRET not properly configured');
    console.log('   Please update your .env.local file with actual Google OAuth credentials');
    return false;
  }
  if (!redirectUri) {
    console.error('❌ VITE_GOOGLE_REDIRECT_URI not configured');
    return false;
  }
  console.log('✅ Environment variables are configured\n');

  // Test 2: Check if auth URL can be generated
  console.log('2. Testing auth URL generation...');
  try {
    const authUrl = googleDriveService.generateAuthUrl();
    if (authUrl && authUrl.includes('accounts.google.com')) {
      console.log('✅ Auth URL generated successfully');
      console.log('   Auth URL:', authUrl.substring(0, 50) + '...\n');
    } else {
      console.error('❌ Invalid auth URL generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    return false;
  }

  // Test 3: Check database tables (this would need to be run in a component with Supabase access)
  console.log('3. Database tables check...');
  console.log('   ⚠️  Please run the SQL script in src/database/google-drive-setup.sql in your Supabase dashboard\n');

  console.log('🎉 Basic integration tests passed!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script in Supabase');
  console.log('2. Start your dev server: npm run dev');
  console.log('3. Navigate to Dashboard > Addons');
  console.log('4. Connect your Google Drive account');
  console.log('5. Try exporting a presentation to Google Drive');

  return true;
}

// Run the test
testGoogleDriveIntegration();
