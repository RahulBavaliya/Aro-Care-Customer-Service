import { useState, useEffect } from 'react';
import { supabase, ScheduledMessage } from '../lib/supabase';

export function useScheduledMessages() {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setScheduledMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addScheduledMessage = async (messageData: Omit<ScheduledMessage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;
      setScheduledMessages(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule message');
      throw err;
    }
  };

  const updateScheduledMessage = async (id: string, updates: Partial<ScheduledMessage>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setScheduledMessages(prev => prev.map(message => 
        message.id === id ? data : message
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scheduled message');
      throw err;
    }
  };

  const deleteScheduledMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setScheduledMessages(prev => prev.filter(message => message.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scheduled message');
      throw err;
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  return {
    scheduledMessages,
    loading,
    error,
    addScheduledMessage,
    updateScheduledMessage,
    deleteScheduledMessage,
    refetch: fetchScheduledMessages
  };
}