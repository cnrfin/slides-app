// Test file for profile avatar functionality
import React from 'react'
import useAuthStore from '@/stores/authStore'

export default function TestProfileAvatar() {
  const { user } = useAuthStore()

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold mb-4">Profile Avatar Test</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Current User Info:</p>
        <ul className="text-sm space-y-1 bg-gray-50 p-4 rounded">
          <li><strong>Email:</strong> {user?.email || 'Not logged in'}</li>
          <li><strong>Display Name:</strong> {user?.display_name || 'Not set'}</li>
          <li><strong>Avatar URL:</strong> {user?.avatar_url || 'No avatar URL'}</li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Instructions to add profile picture:</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Update your Supabase profile table to include an avatar_url</li>
          <li>Upload your profile picture to Supabase Storage or any CDN</li>
          <li>Update the avatar_url field in your profile with the public URL</li>
          <li>Refresh the page to see the updated profile picture in the sidebar</li>
        </ol>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">Expected behavior:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If avatar_url is set: Display the profile picture</li>
          <li>If no avatar_url or image fails to load: Display initials</li>
          <li>Initials are derived from display_name or email</li>
        </ul>
      </div>
    </div>
  )
}
