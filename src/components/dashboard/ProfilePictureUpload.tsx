// Profile Picture Upload Component
// This component can be integrated into the SettingsPage.tsx

import React, { useState, useRef } from 'react'
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase' // Adjust import path as needed

interface ProfilePictureUploadProps {
  onUploadComplete?: (avatarUrl: string) => void
  className?: string
}

export default function ProfilePictureUpload({ 
  onUploadComplete, 
  className = '' 
}: ProfilePictureUploadProps) {
  const { user } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setUploadSuccess(true)
      
      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

      // Refresh user data in auth store
      // You might need to implement a method to refresh user profile
      // Or trigger a re-fetch of user data here

      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error uploading avatar:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl(user.avatar_url || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user) return

    setUploading(true)
    setUploadError(null)

    try {
      // Update profile to remove avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setPreviewUrl(null)
      setUploadSuccess(true)
      
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error removing avatar:', error)
      setUploadError('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const getUserInitials = () => {
    if (user?.display_name) {
      const names = user.display_name.split(' ')
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-app-purple-500 to-app-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-medium">
                  {getUserInitials()}
                </span>
              </div>
            )}
          </div>
          
          {/* Upload Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`
              absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 
              flex items-center justify-center transition-all group
              ${uploading ? 'cursor-wait' : 'cursor-pointer'}
            `}
          >
            <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Remove Button */}
          {previewUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
            <p className="text-xs text-gray-500 mt-1">
              Upload a photo to personalize your account
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`
                px-4 py-2 rounded-lg border border-gray-300 
                flex items-center gap-2 text-sm font-medium
                hover:bg-gray-50 transition-colors
                ${uploading ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Choose Photo
                </>
              )}
            </button>

            {previewUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Status Messages */}
          {uploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Profile picture updated successfully!
            </div>
          )}

          <p className="text-xs text-gray-400">
            Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  )
}

// Usage in SettingsPage.tsx:
// Add this component in the Account Information section:
/*
<ProfilePictureUpload 
  onUploadComplete={(url) => {
    // Optional: Handle completion, e.g., refresh user data
    console.log('New avatar URL:', url)
  }}
/>
*/
