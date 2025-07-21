import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  project_id: string;
  section_key: string;
  comment: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useComments(projectId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all comments for the project
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['feasly-comments', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('feasly_comments')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Comment[];
    },
    enabled: !!projectId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('feasly-comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feasly_comments',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Invalidate and refetch comments when any change occurs
          queryClient.invalidateQueries({ queryKey: ['feasly-comments', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  // Upsert comment mutation
  const upsertCommentMutation = useMutation({
    mutationFn: async ({
      projectId,
      sectionKey,
      comment,
      userId,
    }: {
      projectId: string;
      sectionKey: string;
      comment: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('feasly_comments')
        .upsert(
          {
            project_id: projectId,
            section_key: sectionKey,
            comment,
            user_id: userId,
          },
          {
            onConflict: 'project_id,section_key,user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feasly-comments', projectId] });
    },
    onError: (error) => {
      console.error('Failed to save comment:', error);
      toast.error('Failed to save comment. Please try again.');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async ({
      projectId,
      sectionKey,
      userId,
    }: {
      projectId: string;
      sectionKey: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('feasly_comments')
        .delete()
        .eq('project_id', projectId)
        .eq('section_key', sectionKey)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feasly-comments', projectId] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    },
  });

  // Helper functions
  const getCommentBySection = (sectionKey: string): Comment | undefined => {
    return comments?.find(c => c.section_key === sectionKey);
  };

  const getAllCommentsBySections = (): Record<string, Comment[]> => {
    const commentsBySection: Record<string, Comment[]> = {};
    
    comments?.forEach(comment => {
      if (!commentsBySection[comment.section_key]) {
        commentsBySection[comment.section_key] = [];
      }
      commentsBySection[comment.section_key].push(comment);
    });

    return commentsBySection;
  };

  const upsertComment = async (sectionKey: string, comment: string, userId: string) => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    return upsertCommentMutation.mutateAsync({
      projectId,
      sectionKey,
      comment,
      userId,
    });
  };

  const deleteComment = async (sectionKey: string, userId: string) => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    return deleteCommentMutation.mutateAsync({
      projectId,
      sectionKey,
      userId,
    });
  };

  return {
    comments: comments || [],
    isLoading,
    error,
    upsertComment,
    deleteComment,
    getCommentBySection,
    getAllCommentsBySections,
    isUpsertingComment: upsertCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
}