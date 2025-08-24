import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../lib/supabase';

export function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    filter_type: '',
    birth_date: '',
    guarantee_expiry: '',
    last_service: '',
    next_service: '',
    status: 'Active',
  });

  const {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await addCustomer({
          ...formData,
          join_date: new Date().toISOString().split('T')[0],
          status: formData.status || 'Active',
        });
      }
      resetForm();
    } catch (err) {
      console.error('Error saving customer:', err);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      filter_type: customer.filter_type || '',
      birth_date: customer.birth_date || '',
      guarantee_expiry: customer.guarantee_expiry || '',
      last_service: customer.last_service || '',
      next_service: customer.next_service || '',
      status: customer.status,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      filter_type: '',
      birth_date: '',
      guarantee_expiry: '',
      last_service: '',
      next_service: '',
      status: 'Active',
    });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your customer database and service records
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Customers ({filteredCustomers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        customer.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filter Type
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {customer.filter_type || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Service
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {customer.last_service || 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Service
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {customer.next_service || 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guarantee Expiry
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {customer.guarantee_expiry || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Type
                  </label>
                  <select
                    value={formData.filter_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        filter_type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select Filter Type</option>
                    <option value="RO">RO</option>
                    <option value="UV">UV</option>
                    <option value="UF">UF</option>
                    <option value="RO + UV">RO + UV</option>
                    <option value="UV + UF">UV + UF</option>
                    <option value="RO + UV + UF">RO + UV + UF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Service
                  </label>
                  <input
                    type="date"
                    value={formData.last_service}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_service: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Service
                  </label>
                  <input
                    type="date"
                    value={formData.next_service}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        next_service: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birth_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guarantee Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.guarantee_expiry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        guarantee_expiry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Warranty Expired">Warranty Expired</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
