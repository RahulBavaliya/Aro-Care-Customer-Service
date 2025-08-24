import { useState, useEffect } from 'react';
import { supabase, ServiceReview } from '../lib/supabase';

export function useServiceReviews() {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (reviewData: Omit<ServiceReview, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      setReviews(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    }
  };

  const updateReview = async (id: string, updates: Partial<ServiceReview>) => {
    try {
      const { data, error } = await supabase
        .from('service_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setReviews(prev => prev.map(review => 
        review.id === id ? data : review
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews
  };
}