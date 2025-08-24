import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    AlertTriangle,
    Clock,
    Calendar,
    CheckCircle
  } from 'lucide-react';
  
interface FilterStat {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PendingFilter {
  customerName: string;
  phone: string;
  filterType: string;
  dueDate: string;
  daysOverdue: number;
  priority: 'High' | 'Medium' | 'Low';
}

interface FilterHistory {
  customerName: string;
  filterType: string;
  changeDate: string;
  nextDue: string;
  technician: string;
  status: string;
}

interface UseFilterManagementResult {
  filterStats: FilterStat[];
  pendingFilters: PendingFilter[];
  filterHistory: FilterHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFilterManagement(): UseFilterManagementResult {
  const [filterStats, setFilterStats] = useState<FilterStat[]>([]);
  const [pendingFilters, setPendingFilters] = useState<PendingFilter[]>([]);
  const [filterHistory, setFilterHistory] = useState<FilterHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch filter history with customer name
      const { data: historyData, error: historyError } = await supabase
        .from('filter_changes')
        .select(`
          id,
          filter_type,
          change_date,
          next_due,
          technician,
          status,
          customers ( name )
        `)
        .order('change_date', { ascending: false });

      if (historyError) throw historyError;

      const filterHistory = (historyData || []).map(item => ({
        customerName: item.customers?.name || 'Unknown',
        filterType: item.filter_type,
        changeDate: item.change_date,
        nextDue: item.next_due,
        technician: item.technician || 'Unassigned',
        status: item.status || 'Completed'
      }));

      // Example pending filter logic: filters due in the past and not yet completed
      const { data: pendingData, error: pendingError } = await supabase
        .from('customers')
        .select('name, phone, next_service, filter_type')
        .lte('next_service', today)
        .not('next_service', 'is', null);

      if (pendingError) throw pendingError;

      const pendingFilters = (pendingData || []).map(cust => {
        const dueDate = new Date(cust.next_service);
        const todayDate = new Date();
        const daysOverdue = Math.max(0, Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

        let priority: 'High' | 'Medium' | 'Low' = 'Low';
        if (daysOverdue > 10) priority = 'High';
        else if (daysOverdue > 3) priority = 'Medium';

        return {
          customerName: cust.name || 'Unknown',
          phone: cust.phone || '',
          filterType: cust.filter_type || 'N/A',
          dueDate: cust.next_service,
          daysOverdue,
          priority
        };
      });

      // Dummy stats calculation (replace with real queries if needed)
      const filterStats: FilterStat[] = [
        { label: 'Due Today', value: pendingFilters.filter(p => p.daysOverdue === 0).length, icon: AlertTriangle, color: 'bg-red-500' },
        { label: 'Due This Week', value: pendingFilters.filter(p => p.daysOverdue > 0).length, icon: Clock, color: 'bg-orange-500' },
        { label: 'Due This Month', value: pendingFilters.length, icon: Calendar, color: 'bg-blue-500' },
        { label: 'Completed This Month', value: filterHistory.length, icon: CheckCircle, color: 'bg-green-500' }
      ];

      setFilterStats(filterStats);
      setFilterHistory(filterHistory);
      setPendingFilters(pendingFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filter data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    filterStats,
    pendingFilters,
    filterHistory,
    loading,
    error,
    refetch: fetchData
  };
}
