import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface AlertPreferences {
  npv_threshold: number
  irr_threshold: number
}

export function useAlertPref() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<AlertPreferences>({
    npv_threshold: 0,
    irr_threshold: 0.08
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchPreferences = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('alert_pref')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (data) {
        setPreferences({
          npv_threshold: Number(data.npv_threshold),
          irr_threshold: Number(data.irr_threshold)
        })
      }
    } catch (error) {
      console.error('Error fetching alert preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load alert preferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async (newPreferences: AlertPreferences) => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('alert_pref')
        .upsert({
          user_id: user.id,
          npv_threshold: newPreferences.npv_threshold,
          irr_threshold: newPreferences.irr_threshold
        })

      if (error) throw error

      setPreferences(newPreferences)
      toast({
        title: "Success",
        description: "Alert preferences saved successfully"
      })
    } catch (error) {
      console.error('Error saving alert preferences:', error)
      toast({
        title: "Error", 
        description: "Failed to save alert preferences",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [user])

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    refreshPreferences: fetchPreferences
  }
}