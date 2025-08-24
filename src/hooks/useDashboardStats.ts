import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalCustomers: number;
  birthdaysToday: number;
  filterChangesDue: number;
  messagesSent: number;
  pendingReviews: number;
  guaranteesActive: number;
  recentActivities: Array<{
    type: string;
    message: string;
    time: string;
  }>;
  upcomingTasks: Array<{
    task: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    birthdaysToday: 0,
    filterChangesDue: 0,
    messagesSent: 0,
    pendingReviews: 0,
    guaranteesActive: 0,
    recentActivities: [],
    upcomingTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get birthdays today
      const today = new Date().toISOString().split('T')[0];
      const todayMonth = new Date().getMonth() + 1;
      const todayDay = new Date().getDate();
      
      const { data: customersWithBirthdays } = await supabase
        .from('customers')
        .select('birth_date')
        .not('birth_date', 'is', null);

      // Filter birthdays client-side
      const birthdaysToday = (customersWithBirthdays || []).filter(customer => {
        if (!customer.birth_date) return false;
        const birthDate = new Date(customer.birth_date);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
      }).length;

      // Get filter changes due (next_service is today or past)
      const { count: filterChangesDue } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .not('next_service', 'is', null)
        .lte('next_service', today);

      // Get messages sent this month
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: messagesSent } = await supabase
        .from('scheduled_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Sent')
        .gte('sent_at', firstDayOfMonth);

      // Get pending reviews (reviews with rating < 4)
      const { count: pendingReviews } = await supabase
        .from('service_reviews')
        .select('*', { count: 'exact', head: true })
        .lt('rating', 4);

      // Get active guarantees (guarantee_expiry is in future)
      const { count: guaranteesActive } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .not('guarantee_expiry', 'is', null)
        .gte('guarantee_expiry', today);

      // Get recent activities (recent scheduled messages)
      const { data: recentMessages } = await supabase
        .from('scheduled_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivities = (recentMessages || []).map(msg => ({
        type: msg.message_type.toLowerCase(),
        message: `${msg.message_type} message sent to ${msg.recipient_name}`,
        time: getRelativeTime(msg.created_at)
      }));

      // Generate upcoming tasks based on data
      const upcomingTasks = [
        {
          task: 'Send weekly filter change reminders',
          dueDate: 'Tomorrow',
          priority: 'high' as const
        },
        {
          task: 'Generate monthly service report',
          dueDate: 'In 2 days',
          priority: 'medium' as const
        },
        {
          task: 'Follow up on pending reviews',
          dueDate: 'In 3 days',
          priority: pendingReviews && pendingReviews > 10 ? 'high' as const : 'low' as const
        },
        {
          task: 'Review customer feedback responses',
          dueDate: 'Next week',
          priority: 'medium' as const
        }
      ];

      setStats({
        totalCustomers: totalCustomers || 0,
        birthdaysToday: birthdaysToday || 0,
        filterChangesDue: filterChangesDue || 0,
        messagesSent: messagesSent || 0,
        pendingReviews: pendingReviews || 0,
        guaranteesActive: guaranteesActive || 0,
        recentActivities,
        upcomingTasks
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
}