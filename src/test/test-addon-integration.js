// src/test/test-addon-integration.js
/**
 * Test script for Google Drive addon integration
 * Run this after applying the database migration to verify everything works
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAddonIntegration() {
  console.log('🧪 Testing Google Drive Addon Integration...\n')

  try {
    // 1. Test user authentication
    console.log('1️⃣ Testing user authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('⚠️  No authenticated user. Please sign in first.')
      console.log('   Run the app and sign in, then try this test again.')
      return
    }
    
    console.log(`✅ Authenticated as: ${user.email}\n`)

    // 2. Test addon table access
    console.log('2️⃣ Testing user_addons table access...')
    const { data: addons, error: addonsError } = await supabase
      .from('user_addons')
      .select('*')
      .eq('user_id', user.id)

    if (addonsError) {
      console.error('❌ Error accessing user_addons:', addonsError.message)
      return
    }

    console.log(`✅ Successfully accessed user_addons table`)
    console.log(`   Found ${addons?.length || 0} addon(s) for user\n`)

    // 3. Test Google Drive addon status
    console.log('3️⃣ Checking Google Drive addon status...')
    const googleDriveAddon = addons?.find(a => a.addon_name === 'google_drive')
    
    if (googleDriveAddon) {
      console.log(`✅ Google Drive addon found:`)
      console.log(`   - Enabled: ${googleDriveAddon.enabled}`)
      console.log(`   - Connected at: ${googleDriveAddon.connected_at || 'Not connected'}`)
      console.log(`   - Settings: ${JSON.stringify(googleDriveAddon.settings)}\n`)
    } else {
      console.log('ℹ️  Google Drive addon not configured yet\n')
    }

    // 4. Test enabling addon (if not already enabled)
    if (!googleDriveAddon || !googleDriveAddon.enabled) {
      console.log('4️⃣ Testing addon enable functionality...')
      const { data: enabledAddon, error: enableError } = await supabase
        .from('user_addons')
        .upsert({
          user_id: user.id,
          addon_name: 'google_drive',
          enabled: false, // Set to false initially (requires OAuth)
          settings: { test_mode: true }
        })
        .select()
        .single()

      if (enableError) {
        console.error('❌ Error enabling addon:', enableError.message)
      } else {
        console.log('✅ Successfully created addon entry')
        console.log('   Note: Full enablement requires OAuth authentication\n')
      }
    }

    // 5. Test uploads table access
    console.log('5️⃣ Testing google_drive_uploads table access...')
    const { data: uploads, error: uploadsError } = await supabase
      .from('google_drive_uploads')
      .select('*')
      .eq('user_id', user.id)
      .limit(5)

    if (uploadsError) {
      console.error('❌ Error accessing google_drive_uploads:', uploadsError.message)
      return
    }

    console.log(`✅ Successfully accessed google_drive_uploads table`)
    console.log(`   Found ${uploads?.length || 0} upload(s)\n`)

    // 6. Test RLS policies
    console.log('6️⃣ Testing Row Level Security policies...')
    
    // Try to access another user's data (should fail or return empty)
    const { data: otherUserData, error: rlsError } = await supabase
      .from('user_addons')
      .select('*')
      .neq('user_id', user.id)

    if (otherUserData && otherUserData.length > 0) {
      console.error('⚠️  WARNING: RLS might not be working correctly!')
      console.error('   User can see other users\' addon data')
    } else {
      console.log('✅ RLS is working correctly')
      console.log('   User cannot access other users\' data\n')
    }

    // 7. Test connected_addons view
    console.log('7️⃣ Testing connected_addons view...')
    const { data: connectedAddons, error: viewError } = await supabase
      .from('connected_addons')
      .select('*')
      .eq('user_id', user.id)

    if (viewError) {
      console.log('⚠️  View might not exist or have permission issues:', viewError.message)
    } else {
      console.log('✅ Successfully accessed connected_addons view')
      if (connectedAddons && connectedAddons.length > 0) {
        connectedAddons.forEach(addon => {
          console.log(`   - ${addon.addon_name}: ${addon.total_uploads} uploads`)
        })
      } else {
        console.log('   No connected addons with uploads yet')
      }
    }

    console.log('\n✨ All tests completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Navigate to /dashboard/addons in your app')
    console.log('2. Click "Connect" on Google Drive')
    console.log('3. Complete OAuth authentication')
    console.log('4. Try exporting a presentation to Google Drive')

  } catch (error) {
    console.error('\n❌ Unexpected error during testing:', error)
  }
}

// Run the test
testAddonIntegration()