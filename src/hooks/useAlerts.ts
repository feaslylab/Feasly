import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

interface Alert {
  id: string
  project_id: string
  alert_type: string
  title: string
  body: string
  severity: string
  triggered_at: string
  resolved: boolean
  resolved_at: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export function useAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchAlerts = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('feasly_alerts')
        .select(`
          *,
          projects!inner(user_id)
        `)
        .eq('projects.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setAlerts(data || [])
      setUnreadCount((data || []).filter(alert => !alert.resolved).length)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('feasly_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('resolved', false)
        .in('project_id', alerts.map(a => a.project_id))

      if (error) throw error

      // Update local state
      setAlerts(alerts.map(alert => ({
        ...alert,
        resolved: true,
        resolved_at: new Date().toISOString()
      })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking alerts as read:', error)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [user])

  return {
    alerts,
    loading,
    unreadCount,
    fetchAlerts,
    markAllAsRead
  }
}