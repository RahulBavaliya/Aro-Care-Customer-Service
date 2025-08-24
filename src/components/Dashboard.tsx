import React from 'react';
import { Users, Calendar, Filter, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

export function Dashboard() {
  const { stats: dashboardStats, loading, error } = useDashboardStats();

  const stats = [
    { label: 'Total Customers', value: dashboardStats.totalCustomers.toString(), icon: Users, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Birthdays Today', value: dashboardStats.birthdaysToday.toString(), icon: Calendar, color: 'bg-pink-500', trend: `+${dashboardStats.birthdaysToday}` },
    { label: 'Filter Changes Due', value: dashboardStats.filterChangesDue.toString(), icon: Filter, color: 'bg-orange-500', trend: `+${dashboardStats.filterChangesDue}` },
    { label: 'Messages Sent', value: dashboardStats.messagesSent.toString(), icon: MessageCircle, color: 'bg-green-500', trend: '+24%' },
    { label: 'Pending Reviews', value: dashboardStats.pendingReviews.toString(), icon: AlertTriangle, color: 'bg-yellow-500', trend: '-8%' },
    { label: 'Guarantees Active', value: dashboardStats.guaranteesActive.toString(), icon: CheckCircle2, color: 'bg-teal-500', trend: '+7%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to Dada Aro Care Customer Service Platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {dashboardStats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-sky-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Tasks</h2>
          <div className="space-y-4">
            {dashboardStats.upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                  <p className="text-xs text-gray-500 mt-1">{task.dueDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}