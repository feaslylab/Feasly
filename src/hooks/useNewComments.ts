import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

export interface NewComment {
  id: string
  project_id: string
  scenario_id?: string
  user_id: string
  target?: string
  message: string
  created_at: string
  updated_at: string
}

export interface NewCommentInput {
  project_id: string
  scenario_id?: string
  target?: string
  message: string
}

export function useNewComments(targetId?: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<NewComment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchComments = async () => {
    if (!user || !targetId) return

    setLoading(true)
    try {
      let query = supabase
        .from('comment')
        .select('*')
        .order('created_at', { ascending: true })

      if (targetId.includes(':')) {
        // Target-specific comments (e.g., 'construction_item:123')
        query = query.eq('target', targetId)
      } else {
        // Project-level comments
        query = query.eq('project_id', targetId).is('target', null)
      }

      const { data, error } = await query

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addComment = async (newComment: NewCommentInput) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('comment')
        .insert({
          ...newComment,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state immediately for optimistic updates
      setComments(prev => [...prev, data])

      toast({
        title: "Success",
        description: "Comment added successfully"
      })

      return data
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    }
  }

  // Set up realtime subscription
  useEffect(() => {
    if (!user || !targetId) return

    let channel: any = null

    if (targetId.includes(':')) {
      // Subscribe to target-specific comments
      channel = supabase
        .channel(`comments:${targetId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comment',
            filter: `target=eq.${targetId}`
          },
          (payload) => {
            console.log('New comment received:', payload)
            setComments(prev => [...prev, payload.new as NewComment])
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'comment',
            filter: `target=eq.${targetId}`
          },
          (payload) => {
            console.log('Comment updated:', payload)
            setComments(prev => prev.map(c => 
              c.id === payload.new.id ? payload.new as NewComment : c
            ))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'comment',
            filter: `target=eq.${targetId}`
          },
          (payload) => {
            console.log('Comment deleted:', payload)
            setComments(prev => prev.filter(c => c.id !== payload.old.id))
          }
        )
        .subscribe()
    } else {
      // Subscribe to project-level comments
      channel = supabase
        .channel(`comments:project:${targetId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comment',
            filter: `project_id=eq.${targetId}`
          },
          (payload) => {
            console.log('New project comment received:', payload)
            // Only include if target is null (project-level)
            if (!payload.new.target) {
              setComments(prev => [...prev, payload.new as NewComment])
            }
          }
        )
        .subscribe()
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user, targetId])

  // Initial fetch
  useEffect(() => {
    fetchComments()
  }, [user, targetId])

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments
  }
}