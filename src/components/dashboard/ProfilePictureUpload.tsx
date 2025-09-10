// src/components/dashboard/ProfilePictureUpload.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, Check, AlertCircle, Loader2, User } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface ProfilePictureUploadProps {
  onUploadComplete?: (avatarUrl: string) => void
  className?: string
}

export default function ProfilePictureUpload({ 
  onUploadComplete, 
  className = '' 
}: ProfilePictureUploadProps) {
  const { user, refreshUserData } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url)
      setPreviewUrl(user.avatar_url)
    }
  }, [user?.avatar_url])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Verify user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      setUploadError('You must be logged in to upload an avatar')
      setTimeout(() => setUploadError(null), 5000)
      return
    }

    console.log('Session verified, user ID:', session.user.id)

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      setTimeout(() => setUploadError(null), 5000)
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError('Image size must be less than 5MB')
      setTimeout(() => setUploadError(null), 5000)
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

      // Generate filename - IMPORTANT: Must be in format userId/filename for RLS policy
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${user.id}/${timestamp}.${fileExt}`

      console.log('Upload attempt:', {
        userId: user.id,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type
      })

      // Don't try to create bucket - it already exists
      // Just upload directly
      console.log('Attempting upload to path:', fileName)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true  // This will overwrite if file exists
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        
        // Check if it's an RLS policy error
        if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('policy')) {
          // This might mean the folder structure is wrong or user isn't authenticated properly
          throw new Error('Permission denied. Please ensure you are logged in and try again.')
        }
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      console.log('Public URL generated:', publicUrl)

      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError || !existingProfile) {
        console.error('Profile not found, attempting to create:', fetchError)
        
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || session.user.email,
            avatar_url: publicUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          // Try to cleanup uploaded file
          try {
            await supabase.storage.from('avatars').remove([fileName])
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError)
          }
          throw new Error('Failed to create profile. Please contact support.')
        }

        console.log('Profile created with avatar:', newProfile)
      } else {
        // Update existing profile
        console.log('Updating existing profile with avatar URL...')
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Profile update error:', updateError)
          
          // If profile update fails, try to delete the uploaded file
          try {
            await supabase.storage.from('avatars').remove([fileName])
            console.log('Cleaned up uploaded file after profile update failure')
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError)
          }
          
          // Check if it's an RLS policy error
          if (updateError.message?.includes('row-level security') || updateError.message?.includes('policy')) {
            throw new Error('Permission denied to update profile. Please check your permissions.')
          }
          throw updateError
        }

        console.log('Profile updated successfully:', updateData)
      }

      setAvatarUrl(publicUrl)
      setUploadSuccess(true)
      
      // Refresh user data in auth store
      await refreshUserData()
      
      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error uploading avatar:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl(avatarUrl)
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user) return

    setUploading(true)
    setUploadError(null)

    try {
      // Delete old avatar from storage if it exists
      if (avatarUrl) {
        // Extract the path from the URL
        const urlParts = avatarUrl.split('/storage/v1/object/public/avatars/')
        if (urlParts.length > 1) {
          const path = urlParts[1]
          console.log('Removing avatar at path:', path)
          await supabase.storage.from('avatars').remove([path])
        }
      }

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
      setAvatarUrl(null)
      setUploadSuccess(true)
      
      // Refresh user data in auth store
      await refreshUserData()
      
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error removing avatar:', error)
      setUploadError('Failed to remove avatar')
      setTimeout(() => setUploadError(null), 5000)
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
      <div className="flex items-start gap-6">
        {/* Avatar Preview */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-app-secondary-bg-solid dark:bg-white/5 border-2 border-app-border dark:border-dark-border/20">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-app-green-500 to-app-green-700 dark:from-dark-accent dark:to-dark-accent/70 flex items-center justify-center">
                {user?.display_name ? (
                  <span className="text-white text-2xl font-medium">
                    {getUserInitials()}
                  </span>
                ) : (
                  <User size={32} strokeWidth={1.5} className="text-white" />
                )}
              </div>
            )}
          </div>
          
          {/* Upload Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`
              absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-60
              flex items-center justify-center transition-all
              ${uploading ? 'cursor-wait' : 'cursor-pointer'}
            `}
            aria-label="Upload avatar"
          >
            {uploading ? (
              <Loader2 size={24} className="text-white animate-spin" />
            ) : (
              <Camera size={24} strokeWidth={1.5} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* Remove Button */}
          {previewUrl && !uploading && (
            <button
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="absolute -top-1 -right-1 bg-app-red dark:bg-app-red-600 rounded-full p-1.5 hover:bg-app-red-700 dark:hover:bg-app-red-700 transition-colors shadow-lg"
              aria-label="Remove avatar"
            >
              <X size={14} strokeWidth={2} className="text-white" />
            </button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-app-black dark:text-dark-text">Profile Picture</h4>
            <p className="text-xs text-app-gray dark:text-app-light-gray mt-1">
              Upload a photo to personalize your account
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`
                px-3 py-2 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 
                rounded-lg hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all
                flex items-center gap-2 text-sm font-medium
                ${uploading ? 'opacity-50 cursor-wait' : ''}
                text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text
              `}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} strokeWidth={1.5} />
                  Choose Photo
                </>
              )}
            </button>

            {previewUrl && !uploading && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="px-3 py-2 rounded-lg text-sm font-medium text-app-red dark:text-app-red-400 hover:bg-app-red-50 dark:hover:bg-app-red-900/20 transition-all"
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
            disabled={uploading}
          />

          {/* Status Messages */}
          {uploadError && (
            <div className="flex items-center gap-2 p-2 bg-app-red-50 dark:bg-app-red-900/20 rounded-lg">
              <AlertCircle size={16} strokeWidth={1.5} className="text-app-red dark:text-app-red-400 flex-shrink-0" />
              <span className="text-sm text-app-red dark:text-app-red-400">{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-2 bg-app-green-50 dark:bg-dark-accent/20 rounded-lg">
              <Check size={16} strokeWidth={1.5} className="text-app-green-700 dark:text-dark-accent flex-shrink-0" />
              <span className="text-sm text-app-green-700 dark:text-dark-accent">
                Profile picture updated successfully!
              </span>
            </div>
          )}

          <p className="text-xs text-app-gray dark:text-app-light-gray">
            Accepted formats: JPEG, PNG, GIF, WebP • Max size: 5MB
          </p>
        </div>
      </div>
    </div>
  )
}