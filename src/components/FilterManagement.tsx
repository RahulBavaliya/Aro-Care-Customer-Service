import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useFilterManagement } from '../hooks/useFilterManagement';

export function FilterManagement() {
  const [activeView, setActiveView] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);
  const [formData, setFormData] = useState({
    technician: '',
    notes: '',
    nextDue: '',
    changeDate: new Date().toISOString().split('T')[0],
  });

  const {
    filterStats,
    pendingFilters,
    filterHistory,
    loading,
    error,
    refetch,
    addFilterChange,
  } = useFilterManagement();

  const openCompleteModal = (filter: any) => {
    setSelectedFilter(filter);
    setFormData({
      technician: '',
      notes: '',
      nextDue: '',
      changeDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleCompleteSubmit = async () => {
    if (!selectedFilter) return;
    await addFilterChange({
      customerId: selectedFilter.customerId,
      filterType: selectedFilter.filterType,
      changeDate: formData.changeDate,
      nextDue: formData.nextDue,
      technician: formData.technician,
      notes: formData.notes,
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Filter Management</h1>
        <p className="text-gray-600 mt-2">
          Track filter changes and maintenance schedules
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pending', label: 'Pending Changes' },
              { id: 'history', label: 'Change History' },
              { id: 'schedule', label: 'Schedule' },
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
          {/* ---- OVERVIEW ---- */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.color} rounded-lg p-3`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Monthly Filter Change Trends
                </h4>
                <div className="text-center text-gray-500 py-8">
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Filter change trend chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {/* ---- PENDING ---- */}
          {activeView === 'pending' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Filter Changes
                </h3>
                <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Send Reminders
                </button>
              </div>

              <div className="space-y-3">
                {pendingFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {filter.customerName}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              filter.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : filter.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
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
                            <p className="text-red-600 font-semibold">
                              {filter.daysOverdue} days
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          Schedule
                        </button>
                        <button
                          onClick={() => openCompleteModal(filter)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- HISTORY ---- */}
          {activeView === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Change History
              </h3>

              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : filterHistory.length === 0 ? (
                <p className="text-gray-500">No history records found.</p>
              ) : (
                filterHistory.map((record, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {record.customerName}
                        </h4>
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
                ))
              )}
            </div>
          )}

          {/* ---- SCHEDULE ---- */}
          {activeView === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Change Schedule
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>
                    Interactive calendar for scheduling filter changes will be
                    displayed here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- COMPLETE MODAL ---- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Complete Filter Change
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.technician}
                  onChange={(e) =>
                    setFormData({ ...formData, technician: e.target.value })
                  }
                />
              </div>

              {/* Change Date + Next Due Date in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.changeDate}
                    onChange={(e) =>
                      setFormData({ ...formData, changeDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.nextDue}
                    onChange={(e) =>
                      setFormData({ ...formData, nextDue: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                onClick={handleCompleteSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Complete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
