import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InputTemplate {
  id: string;
  template_name: string;
  created_by?: string;
  template_data: any; // Using any instead of Record<string, any> to match Supabase Json type
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useInputTemplates = () => {
  const [templates, setTemplates] = useState<InputTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('project_input_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates((data || []) as InputTemplate[]);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (name: string, templateData: Record<string, any>, isPublic: boolean = false) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('project_input_templates')
        .insert([{
          template_name: name,
          created_by: user.user.id,
          template_data: templateData,
          is_public: isPublic,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTemplates(prev => [data as InputTemplate, ...prev]);
        toast({
          title: 'Template Saved',
          description: `Template "${name}" has been saved successfully.`,
        });
      }

      return data;
    } catch (err) {
      console.error('Error saving template:', err);
      toast({
        title: 'Error',
        description: 'Failed to save template. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const loadTemplate = (templateId: string): InputTemplate | null => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: 'Template Loaded',
        description: `Template "${template.template_name}" has been loaded.`,
      });
    }
    return template || null;
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('project_input_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast({
        title: 'Template Deleted',
        description: 'Template has been deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting template:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<Pick<InputTemplate, 'template_name' | 'template_data' | 'is_public'>>) => {
    try {
      const { data, error } = await supabase
        .from('project_input_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTemplates(prev => 
          prev.map(template => template.id === templateId ? data as InputTemplate : template)
        );
        toast({
          title: 'Template Updated',
          description: 'Template has been updated successfully.',
        });
      }

      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    refetch: fetchTemplates
  };
};