import { useState, useEffect } from 'react';
import { supabase, Customer } from '../lib/supabase';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      setCustomers((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === id ? data : customer))
      );
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update customer'
      );
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);

      if (error) throw error;
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete customer'
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}
