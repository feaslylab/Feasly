import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

export interface PresenceUser {
  user_id: string
  display_name?: string
  avatar_url?: string
  initials: string
  color: string
  last_seen: string
}

const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const getInitials = (name?: string) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function usePresence(projectId: string) {
  const { user } = useAuth()
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [channel, setChannel] = useState<any>(null)

  useEffect(() => {
    if (!user || !projectId) return

    const presenceChannel = supabase.channel(`presence:${projectId}`)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        if (!import.meta.env.PROD) console.log('Presence sync:', state)
        
        const users: PresenceUser[] = []
        Object.entries(state).forEach(([userId, presences]: [string, any[]]) => {
          const presence = presences[0] // Get the latest presence
          if (presence && userId !== user.id) { // Exclude current user
            users.push({
              user_id: userId,
              display_name: presence.display_name,
              avatar_url: presence.avatar_url,
              initials: getInitials(presence.display_name || presence.email),
              color: getRandomColor(),
              last_seen: presence.last_seen
            })
          }
        })
        
        setPresenceUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (!import.meta.env.PROD) console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (!import.meta.env.PROD) console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence with email
          await presenceChannel.track({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            email: user.email,
            last_seen: new Date().toISOString()
          })
        }
      })

    setChannel(presenceChannel)

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User came back to tab - update presence
        presenceChannel.track({
          user_id: user.id,
          last_seen: new Date().toISOString()
        })
      }
    }

    const handleBeforeUnload = () => {
      // User is leaving - untrack presence
      presenceChannel.untrack()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (presenceChannel) {
        presenceChannel.untrack()
        supabase.removeChannel(presenceChannel)
      }
    }
  }, [user, projectId])

  const updatePresence = (data: Partial<PresenceUser>) => {
    if (channel) {
      channel.track({
        user_id: user?.id,
        last_seen: new Date().toISOString(),
        ...data
      })
    }
  }

  return {
    presenceUsers,
    updatePresence
  }
}