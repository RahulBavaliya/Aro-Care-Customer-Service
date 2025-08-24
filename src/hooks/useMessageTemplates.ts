import { useState, useEffect } from 'react';
import { supabase, MessageTemplate } from '../lib/supabase';

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => prev.map(template => 
        template.id === id ? data : template
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  };
}