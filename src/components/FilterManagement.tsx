import React, { useState } from 'react';
import { Filter, Calendar, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

export function FilterManagement() {
  const [activeView, setActiveView] = useState('overview');

  const filterStats = [
    { label: 'Due Today', value: '15', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Due This Week', value: '47', icon: Clock, color: 'bg-orange-500' },
    { label: 'Due This Month', value: '124', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Completed This Month', value: '289', icon: CheckCircle, color: 'bg-green-500' }
  ];

  const pendingFilters = [
    {
      customerName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      filterType: 'RO + UV',
      installDate: '2023-01-15',
      dueDate: '2024-01-15',
      daysOverdue: 15,
      priority: 'High'
    },
    {
      customerName: 'Priya Patel',
      phone: '+91 87654 32109',
      filterType: 'UV + UF',
      installDate: '2023-03-20',
      dueDate: '2024-03-20',
      daysOverdue: 8,
      priority: 'High'
    },
    {
      customerName: 'Amit Kumar',
      phone: '+91 76543 21098',
      filterType: 'RO',
      installDate: '2023-06-10',
      dueDate: '2024-06-10',
      daysOverdue: 0,
      priority: 'Medium'
    }
  ];

  const filterChangeHistory = [
    {
      customerName: 'Sunita Devi',
      filterType: 'RO + UV',
      changeDate: '2024-01-20',
      nextDue: '2024-07-20',
      technician: 'Ravi Kumar',
      status: 'Completed'
    },
    {
      customerName: 'Rajesh Gupta',
      filterType: 'UV',
      changeDate: '2024-01-18',
      nextDue: '2024-04-18',
      technician: 'Suresh Yadav',
      status: 'Completed'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Filter Management</h1>
        <p className="text-gray-600 mt-2">Track filter changes and maintenance schedules</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filterStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pending', label: 'Pending Changes' },
              { id: 'history', label: 'Change History' },
              { id: 'schedule', label: 'Schedule' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Filter Change Overview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-red-900">Overdue Filters</h4>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-900">23</p>
                  <p className="text-sm text-red-700 mt-2">Immediate attention required</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-900">Due This Month</h4>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">124</p>
                  <p className="text-sm text-blue-700 mt-2">Schedule appointments</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Monthly Filter Change Trends</h4>
                <div className="text-center text-gray-500 py-8">
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Filter change trend chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'pending' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pending Filter Changes</h3>
                <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Send Reminders
                </button>
              </div>

              <div className="space-y-3">
                {pendingFilters.map((filter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{filter.customerName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            filter.priority === 'High' ? 'bg-red-100 text-red-800' :
                            filter.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {filter.priority}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Phone</p>
                            <p>{filter.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium">Filter Type</p>
                            <p>{filter.filterType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p>{filter.dueDate}</p>
                          </div>
                          <div>
                            <p className="font-medium">Days Overdue</p>
                            <p className="text-red-600 font-semibold">{filter.daysOverdue} days</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          Schedule
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Change History</h3>
              
              <div className="space-y-3">
                {filterChangeHistory.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{record.customerName}</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Filter Type</p>
                            <p>{record.filterType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Change Date</p>
                            <p>{record.changeDate}</p>
                          </div>
                          <div>
                            <p className="font-medium">Next Due</p>
                            <p>{record.nextDue}</p>
                          </div>
                          <div>
                            <p className="font-medium">Technician</p>
                            <p>{record.technician}</p>
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Filter Change Schedule</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Interactive calendar for scheduling filter changes will be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}