// src/components/dashboard/PasswordUpdateModal.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from 'lucide-react'

interface PasswordUpdateModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PasswordUpdateModal({ isOpen, onClose }: PasswordUpdateModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-app-red', 'bg-app-orange', 'bg-app-yellow', 'bg-app-green']
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const validateForm = () => {
    setError(null)

    if (!currentPassword) {
      setError('Current password is required')
      return false
    }

    if (!newPassword) {
      setError('New password is required')
      return false
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return false
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password')
      return false
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleUpdatePassword = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // First, verify the current password by attempting to sign in
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.email) {
        throw new Error('Unable to verify user session')
      }

      // Attempt to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        setError('Current password is incorrect')
        setLoading(false)
        return
      }

      // Update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Close modal after a delay
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('Error updating password:', error)
      setError(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg max-w-md w-full animate-popup-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-border dark:border-dark-border/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-app-green-100 dark:bg-dark-accent/20 rounded-lg">
              <Lock size={20} strokeWidth={1.5} className="text-app-green-700 dark:text-dark-accent" />
            </div>
            <div>
              <h2 className="text-h5 text-app-black dark:text-dark-text">Change Password</h2>
              <p className="text-body-small text-app-gray dark:text-app-light-gray">
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 hover:bg-app-secondary-bg-solid dark:hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
          >
            <X size={20} strokeWidth={1.5} className="text-app-gray dark:text-app-light-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-transparent dark:text-dark-text dark:placeholder-dark-border border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                placeholder="Enter current password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-transparent dark:text-dark-text dark:placeholder-dark-border border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : 'bg-app-border dark:bg-dark-border/20'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.label && (
                  <p className="text-xs text-app-gray dark:text-app-light-gray">
                    Password strength: {passwordStrength.label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-app-black dark:text-dark-text mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-transparent dark:text-dark-text dark:placeholder-dark-border border border-app-border dark:border-dark-border/20 rounded-lg focus:outline-none focus:border-app-green-700 dark:focus:border-dark-accent transition-colors"
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-gray dark:text-app-light-gray hover:text-app-black dark:hover:text-dark-text transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-app-red dark:text-app-red-400 mt-1">
                Passwords do not match
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-app-green-700 dark:text-dark-accent mt-1 flex items-center gap-1">
                <Check size={12} strokeWidth={2} />
                Passwords match
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-app-secondary-bg-solid dark:bg-white/5 rounded-lg">
            <p className="text-xs font-medium text-app-black dark:text-dark-text mb-2">
              Password Requirements:
            </p>
            <ul className="space-y-1 text-xs text-app-gray dark:text-app-light-gray">
              <li className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-app-green' : 'bg-app-border'}`} />
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/) ? 'bg-app-green' : 'bg-app-border'}`} />
                Mix of uppercase and lowercase letters
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${newPassword.match(/[0-9]/) ? 'bg-app-green' : 'bg-app-border'}`} />
                At least one number
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${newPassword.match(/[^a-zA-Z0-9]/) ? 'bg-app-green' : 'bg-app-border'}`} />
                At least one special character
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-app-red-50 dark:bg-app-red-900/20 rounded-lg">
              <AlertCircle size={16} strokeWidth={1.5} className="text-app-red dark:text-app-red-400 flex-shrink-0" />
              <span className="text-sm text-app-red dark:text-app-red-400">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-app-green-50 dark:bg-dark-accent/20 rounded-lg">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-app-green-700 dark:text-dark-accent flex-shrink-0" />
              <span className="text-sm text-app-green-700 dark:text-dark-accent">
                Password updated successfully!
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-app-border dark:border-dark-border/20">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-white dark:bg-dark-card border border-app-border dark:border-dark-border/20 rounded-lg text-app-gray dark:text-app-light-gray hover:bg-app-secondary-bg-solid dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePassword}
            disabled={loading || success}
            className="flex-1 px-4 py-2 bg-app-green dark:bg-dark-accent text-white rounded-lg hover:bg-app-green-700 dark:hover:bg-dark-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : success ? (
              <>
                <Check size={16} strokeWidth={1.5} />
                Updated!
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}