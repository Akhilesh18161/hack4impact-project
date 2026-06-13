'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/auth-provider'
import { authClient } from '@/lib/auth-client'
import { supabase } from '@/lib/supabase'
import { 
  Camera, User, AtSign, Mail, Phone, Lock, ShieldCheck, 
  Save, LogOut, ChevronRight, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AccountPage() {
  const { user, signOut, isAdmin } = useAuth()
  
  // Forms state
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize state when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setUsername(user.username || '')
      setPhone(user.phone || '')
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-5 animate-spin" /> Loading your account...
        </p>
      </div>
    )
  }

  // ── Profile Handlers ──
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setProfileMsg(null)

    // Validate username if changed
    if (username !== user.username) {
      const available = await authClient.isUsernameAvailable(username)
      if (!available) {
        setProfileMsg({ type: 'error', text: 'That username is already taken.' })
        setIsSavingProfile(false)
        return
      }
    }

    const { error } = await authClient.updateProfile(user.id, { 
      fullName, 
      username, 
      phone 
    })

    setIsSavingProfile(false)
    if (error) {
      setProfileMsg({ type: 'error', text: error })
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
      // Reload page to refresh AuthProvider context globally
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  // ── Password Handlers ──
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setIsSavingPassword(true)
    setPasswordMsg(null)

    // Verify current password first by doing a sign in (Supabase requires this for security unless we use a token)
    const { session, error: signInError } = await authClient.signIn(user.email, currentPassword)
    if (signInError || !session) {
      setPasswordMsg({ type: 'error', text: 'Incorrect current password.' })
      setIsSavingPassword(false)
      return
    }

    // Now update password
    const { error } = await authClient.updatePassword(newPassword)
    setIsSavingPassword(false)

    if (error) {
      setPasswordMsg({ type: 'error', text: error })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  // ── Avatar Handler ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large (max 5MB)")
      return
    }

    setIsUploadingAvatar(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`)
      setIsUploadingAvatar(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = publicUrlData.publicUrl

    const { error: updateError } = await authClient.updateProfile(user.id, { avatarUrl })
    setIsUploadingAvatar(false)

    if (!updateError) {
      window.location.reload()
    } else {
      alert("Failed to update profile with new image.")
    }
  }

  const initials = user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Account</h1>
        <p className="mt-2 text-muted-foreground">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-8">
        
        {/* ── Left Sidebar ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group mb-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="size-24 rounded-full object-cover shadow-xl border-4 border-background" />
              ) : (
                <div className={`flex size-24 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-black text-white shadow-xl ${isAdmin ? 'from-destructive to-rose-700' : 'from-primary to-emerald-600'}`}>
                  {initials}
                </div>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-background border border-border text-foreground hover:text-primary transition-colors shadow-sm group-hover:scale-105 disabled:opacity-50"
              >
                {isUploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
            </div>
            <h2 className="text-lg font-bold text-foreground truncate w-full">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground truncate w-full mb-3">@{user.username}</p>
            <Badge className={`h-5 border-none px-2 text-[10px] font-bold ${isAdmin ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>
              {isAdmin ? <ShieldCheck className="mr-1 size-3" /> : <User className="mr-1 size-3" />}
              {isAdmin ? 'Administrator' : 'Community Member'}
            </Badge>
          </div>

          <nav className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <ul className="flex flex-col">
              <li>
                <button className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors border-b border-border/50">
                  <div className="flex items-center gap-3"><User className="size-4 text-primary" /> Personal Info</div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-50" />
                </button>
              </li>
              <li>
                <button className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/50 transition-colors border-b border-border/50">
                  <div className="flex items-center gap-3"><Lock className="size-4 text-primary" /> Security & Password</div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-50" />
                </button>
              </li>
              <li>
                <button onClick={signOut} className="w-full flex items-center gap-3 p-4 text-left text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
                  <LogOut className="size-4" /> Sign Out
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex flex-col gap-6">
          
          {/* Profile Form */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="size-5 text-primary" /> Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._@#$]/g, ''))} maxLength={20} className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Lowercase letters, numbers and . _ @ # $ only.</p>
                </div>

                <div className="flex flex-col gap-2 opacity-60">
                  <label className="text-xs font-semibold text-foreground">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input type="email" value={user.email} readOnly className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-4 text-sm outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 border-t border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                {profileMsg && (
                  <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-semibold flex items-center gap-1 ${profileMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                    {profileMsg.text}
                  </motion.p>
                )}
              </div>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="gap-2 font-bold px-6 w-full md:w-auto">
                {isSavingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Password Form */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-2">
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Lock className="size-5 text-primary" /> Update Password</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-border bg-muted/30 py-2 px-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                </div>
                <div className="hidden md:block"></div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-border bg-muted/30 py-2 px-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-border bg-muted/30 py-2 px-4 text-sm outline-none focus:border-primary/50 focus:bg-background transition-all" />
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  {passwordMsg && (
                    <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-semibold flex items-center gap-1 ${passwordMsg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {passwordMsg.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                      {passwordMsg.text}
                    </motion.p>
                  )}
                </div>
                <Button variant="outline" onClick={handleUpdatePassword} disabled={isSavingPassword} className="font-semibold w-full md:w-auto gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                  {isSavingPassword && <Loader2 className="size-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
