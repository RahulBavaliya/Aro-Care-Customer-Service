import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Filter, TrendingUp } from 'lucide-react';
import { useServiceReviews } from '../hooks/useServiceReviews';
import { useCustomers } from '../hooks/useCustomers';
import { ServiceReview } from '../lib/supabase';

export function ServiceReviews() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ServiceReview | null>(null);
  const [reviewFormData, setReviewFormData] = useState({
    customer_id: '',
    customer_name: '',
    rating: 5,
    service_type: '',
    comment: '',
    technician: '',
    review_date: new Date().toISOString().split('T')[0]
  });

  const { reviews, loading, error, addReview, updateReview, deleteReview } = useServiceReviews();
  const { customers } = useCustomers();

  const reviewStats = [
    { label: 'Total Reviews', value: '1,247', icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'bg-yellow-500' },
    { label: 'This Month', value: '89', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Positive Reviews', value: '94%', icon: ThumbsUp, color: 'bg-emerald-500' }
  ];


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await updateReview(editingReview.id, reviewFormData);
      } else {
        await addReview(reviewFormData);
      }
      resetReviewForm();
    } catch (err) {
      console.error('Error saving review:', err);
    }
  };

  const handleEditReview = (review: ServiceReview) => {
    setEditingReview(review);
    setReviewFormData({
      customer_id: review.customer_id,
      customer_name: review.customer_name,
      rating: review.rating,
      service_type: review.service_type,
      comment: review.comment || '',
      technician: review.technician || '',
      review_date: review.review_date
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id);
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  const resetReviewForm = () => {
    setReviewFormData({
      customer_id: '',
      customer_name: '',
      rating: 5,
      service_type: '',
      comment: '',
      technician: '',
      review_date: new Date().toISOString().split('T')[0]
    });
    setEditingReview(null);
    setShowReviewForm(false);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setReviewFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: customer.name
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading reviews...</div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Reviews</h1>
        <p className="text-gray-600 mt-2">Monitor customer feedback and service quality</p>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviewStats.map((stat, index) => (
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

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 w-20">
                <span className="text-sm font-medium text-gray-700">{stars}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full" 
                  style={{ 
                    width: stars === 5 ? '78%' : 
                           stars === 4 ? '16%' : 
                           stars === 3 ? '4%' : 
                           stars === 2 ? '1%' : '1%' 
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12">
                {stars === 5 ? '972' : 
                 stars === 4 ? '199' : 
                 stars === 3 ? '50' : 
                 stars === 2 ? '13' : '13'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Recent Reviews' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'responses', label: 'Response Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Customer Reviews</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Review
                  </button>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option>All Services</option>
                    <option>Filter Installation</option>
                    <option>Filter Change</option>
                    <option>Maintenance</option>
                    <option>RO Service</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option>All Ratings</option>
                    <option>5 Stars</option>
                    <option>4 Stars</option>
                    <option>3 Stars</option>
                    <option>2 Stars</option>
                    <option>1 Star</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{review.review_date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {review.service_type}
                          </span>
                          {review.technician && <span>Technician: {review.technician}</span>}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button 
                            onClick={() => handleEditReview(review)}
                            className="text-sky-600 hover:text-sky-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>Respond</span>
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful</span>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">Review ID: #{review.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Service Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Filter Installation</span>
                      <span className="font-semibold text-blue-900">4.9/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Filter Change</span>
                      <span className="font-semibold text-blue-900">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">Maintenance</span>
                      <span className="font-semibold text-blue-900">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800">RO Service</span>
                      <span className="font-semibold text-blue-900">4.9/5</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">Technician Ratings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Ravi Kumar</span>
                      <span className="font-semibold text-green-900">4.9/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Suresh Yadav</span>
                      <span className="font-semibold text-green-900">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Vikash Singh</span>
                      <span className="font-semibold text-green-900">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Mohan Lal</span>
                      <span className="font-semibold text-green-900">4.6/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Review Trends</h4>
                <div className="text-center text-gray-500 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Review trend charts will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Response Management</h3>
                <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Create Template
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Response templates and automated reply management will be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingReview ? 'Edit Review' : 'Add New Review'}
            </h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                  <select
                    required
                    value={reviewFormData.customer_id}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <select
                    required
                    value={reviewFormData.service_type}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select Service</option>
                    <option value="Filter Installation">Filter Installation</option>
                    <option value="Filter Change">Filter Change</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="RO Service">RO Service</option>
                    <option value="Repair">Repair</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                  <select
                    required
                    value={reviewFormData.rating}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Very Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technician</label>
                  <input
                    type="text"
                    value={reviewFormData.technician}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, technician: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
                  <input
                    type="date"
                    value={reviewFormData.review_date}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, review_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  rows={4}
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Customer feedback and comments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingReview ? 'Update Review' : 'Add Review'}
                </button>
                <button
                  type="button"
                  onClick={resetReviewForm}
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