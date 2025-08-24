import React, { useState, useEffect } from 'react';
import { Send, Calendar, Edit, Trash2, Plus, MessageSquare, Users, Clock, Smartphone, MessageCircle } from 'lucide-react';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import { useScheduledMessages } from '../hooks/useScheduledMessages';
import { useCustomers } from '../hooks/useCustomers';
import { sendMessage, sendBulkMessages, updateScheduledMessageStatus } from '../lib/messaging';

export function MessageCenter() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingScheduled, setEditingScheduled] = useState<any>(null);
  
  const { templates, loading: templatesLoading, addTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  const { scheduledMessages, loading: scheduledLoading, addScheduledMessage, updateScheduledMessage, deleteScheduledMessage } = useScheduledMessages();
  const { customers } = useCustomers();

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    type: 'birthday',
    title: '',
    content: '',
    status: 'Active'
  });

  // Scheduled message form state
  const [scheduledForm, setScheduledForm] = useState({
    customer_id: '',
    template_id: '',
    recipient_name: '',
    message_type: 'birthday',
    scheduled_for: '',
    message_method: 'whatsapp',
    template_content: '',
    recipient_phone: ''
  });

  // Compose message state
  const [composeForm, setComposeForm] = useState({
    message_type: 'birthday',
    template_id: '',
    recipients: 'all',
    message_method: 'whatsapp',
    scheduled_for: '',
    send_now: true
  });

  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);

  const messageTypes = [
    { value: 'birthday', label: 'Birthday Message' },
    { value: 'welcome', label: 'Welcome Message' },
    { value: 'filter_reminder', label: 'Filter Reminder' },
    { value: 'guarantee', label: 'Guarantee Notification' },
    { value: 'promotional', label: 'Promotional Message' },
    { value: 'loan', label: 'Loan Message' }
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'birthday_today', label: 'Birthday Today' },
    { value: 'filter_due', label: 'Filter Due' }
  ];

  // Filter customers based on recipient selection
  useEffect(() => {
    if (!customers) return;

    let filtered = [];
    const today = new Date().toISOString().split('T')[0];

    switch (composeForm.recipients) {
      case 'birthday_today':
        filtered = customers.filter(customer => {
          if (!customer.birth_date) return false;
          const birthDate = new Date(customer.birth_date);
          const todayDate = new Date(today);
          return birthDate.getMonth() === todayDate.getMonth() && 
                 birthDate.getDate() === todayDate.getDate();
        });
        break;
      case 'filter_due':
        filtered = customers.filter(customer => {
          if (!customer.next_service) return false;
          return customer.next_service <= today;
        });
        break;
      default:
        filtered = customers;
    }

    setSelectedCustomers(filtered || []);
  }, [composeForm.recipients, customers]);

  // Load template content when template is selected in compose
  useEffect(() => {
    if (composeForm.template_id && templates) {
      const selectedTemplate = templates.find(t => t.id === composeForm.template_id);
      if (selectedTemplate) {
        setComposeForm(prev => ({ ...prev, message_type: selectedTemplate.type }));
      }
    }
  }, [composeForm.template_id, templates]);

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateForm);
        setEditingTemplate(null);
      } else {
        await addTemplate(templateForm);
      }
      setTemplateForm({ type: 'birthday', title: '', content: '', status: 'Active' });
      setShowTemplateForm(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleScheduledSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers?.find(c => c.id === scheduledForm.customer_id);
      const selectedTemplate = templates?.find(t => t.id === scheduledForm.template_id);
      
      const messageData = {
        ...scheduledForm,
        recipient_name: selectedCustomer?.name || scheduledForm.recipient_name,
        recipient_phone: selectedCustomer?.phone || scheduledForm.recipient_phone,
        template_content: selectedTemplate?.content || scheduledForm.template_content,
        message_type: selectedTemplate?.type || scheduledForm.message_type
      };

      if (editingScheduled) {
        await updateScheduledMessage(editingScheduled.id, messageData);
        setEditingScheduled(null);
      } else {
        await addScheduledMessage(messageData);
      }
      
      setScheduledForm({
        customer_id: '',
        template_id: '',
        recipient_name: '',
        message_type: 'birthday',
        scheduled_for: '',
        message_method: 'whatsapp',
        template_content: '',
        recipient_phone: ''
      });
      setShowScheduleForm(false);
    } catch (error) {
      console.error('Error saving scheduled message:', error);
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCustomers.length === 0) {
      alert('No customers selected for messaging');
      return;
    }
    
    const selectedTemplate = templates?.find(t => t.id === composeForm.template_id);
    if (!selectedTemplate) {
      alert('Please select a message template');
      return;
    }

    // Show confirmation dialog
    const confirmMessage = `Send ${composeForm.message_method.toUpperCase()} message to ${selectedCustomers.length} customers?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Prepare messages for bulk sending
    const messages = selectedCustomers.map(customer => {
      let personalizedContent = selectedTemplate.content;
      personalizedContent = personalizedContent
        .replace(/\[NAME\]/g, customer.name)
        .replace(/\[PHONE\]/g, customer.phone)
        .replace(/\[FILTER_TYPE\]/g, customer.filter_type || 'Standard');

      return {
        to: customer.phone,
        message: personalizedContent,
        method: composeForm.message_method as 'whatsapp' | 'sms',
        customerName: customer.name,
        customerId: customer.id,
      };
    });

    try {
      if (composeForm.send_now) {
        // Send messages immediately
        const result = await sendBulkMessages(messages);
        
        // Save successful messages to database
        for (const successMsg of result.results) {
          const messageData = {
            customer_id: successMsg.customerId,
            template_id: composeForm.template_id,
            recipient_name: successMsg.customerName,
            recipient_phone: successMsg.to,
            message_type: composeForm.message_type,
            message_method: composeForm.message_method,
            template_content: messages.find(m => m.customerId === successMsg.customerId)?.message || '',
            scheduled_for: new Date().toISOString(),
            status: 'Sent',
            sent_at: new Date().toISOString()
          };
          await addScheduledMessage(messageData);
        }
        
        // Save failed messages to database
        for (const errorMsg of result.errors) {
          const messageData = {
            customer_id: errorMsg.customerId,
            template_id: composeForm.template_id,
            recipient_name: errorMsg.customerName,
            recipient_phone: errorMsg.to,
            message_type: composeForm.message_type,
            message_method: composeForm.message_method,
            template_content: messages.find(m => m.customerId === errorMsg.customerId)?.message || '',
            scheduled_for: new Date().toISOString(),
            status: 'Failed',
            sent_at: new Date().toISOString()
          };
          await addScheduledMessage(messageData);
        }
        
        alert(`Messages sent! Success: ${result.successCount}, Failed: ${result.errorCount}`);
      } else {
        // Schedule messages for later
        for (const message of messages) {
          const messageData = {
            customer_id: message.customerId,
            template_id: composeForm.template_id,
            recipient_name: message.customerName,
            recipient_phone: message.to,
            message_type: composeForm.message_type,
            message_method: composeForm.message_method,
            template_content: message.message,
            scheduled_for: new Date(composeForm.scheduled_for).toISOString(),
            status: 'Scheduled'
          };
          await addScheduledMessage(messageData);
        }
        
        alert(`${messages.length} messages scheduled successfully!`);
      }

      setComposeForm({
        message_type: 'birthday',
        template_id: '',
        recipients: 'all',
        message_method: 'whatsapp',
        scheduled_for: '',
        send_now: true
      });
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('Failed to send messages. Please try again.');
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowTemplateForm(true);
  };

  const handleEditScheduled = (message: any) => {
    setEditingScheduled(message);
    setScheduledForm({
      customer_id: message.customer_id || '',
      template_id: message.template_id || '',
      recipient_name: message.recipient_name,
      message_type: message.message_type,
      scheduled_for: message.scheduled_for ? new Date(message.scheduled_for).toISOString().slice(0, 16) : '',
      message_method: message.message_method || 'whatsapp',
      template_content: message.template_content || '',
      recipient_phone: message.recipient_phone || ''
    });
    setShowScheduleForm(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled message?')) {
      await deleteScheduledMessage(id);
    }
  };

  const filteredTemplates = templates?.filter(t => 
    composeForm.message_type === 'all' || t.type === composeForm.message_type
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates', label: 'Message Templates', icon: MessageSquare },
            { id: 'scheduled', label: 'Scheduled Messages', icon: Calendar },
            { id: 'compose', label: 'Compose Message', icon: Send }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
            <button
              onClick={() => setShowTemplateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Template</span>
            </button>
          </div>

          {/* Template Form */}
          {showTemplateForm && (
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold mb-4">
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </h3>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Type
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {messageTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={templateForm.status}
                      onChange={(e) => setTemplateForm({ ...templateForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Title
                  </label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Use [NAME], [PHONE], [FILTER_TYPE] for personalization"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingTemplate ? 'Update Template' : 'Add Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateForm(false);
                      setEditingTemplate(null);
                      setTemplateForm({ type: 'birthday', title: '', content: '', status: 'Active' });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading ? (
              <div className="col-span-full text-center py-8">Loading templates...</div>
            ) : templates?.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">No templates found</div>
            ) : (
              templates?.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow-md border">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{template.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 capitalize">
                    {template.type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {template.content}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Scheduled Messages Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Scheduled Messages</h2>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Message</span>
            </button>
          </div>

          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold mb-4">
                {editingScheduled ? 'Edit Scheduled Message' : 'Schedule New Message'}
              </h3>
              <form onSubmit={handleScheduledSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <select
                      value={scheduledForm.customer_id}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, customer_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Customer</option>
                      {customers?.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template
                    </label>
                    <select
                      value={scheduledForm.template_id}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, template_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Template</option>
                      {templates?.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={scheduledForm.recipient_name}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, recipient_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={scheduledForm.recipient_phone}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, recipient_phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledForm.scheduled_for}
                      onChange={(e) => setScheduledForm({ ...scheduledForm, scheduled_for: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Method
                    </label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="whatsapp"
                          checked={scheduledForm.message_method === 'whatsapp'}
                          onChange={(e) => setScheduledForm({ ...scheduledForm, message_method: e.target.value })}
                          className="mr-2"
                        />
                        <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                        WhatsApp
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="sms"
                          checked={scheduledForm.message_method === 'sms'}
                          onChange={(e) => setScheduledForm({ ...scheduledForm, message_method: e.target.value })}
                          className="mr-2"
                        />
                        <Smartphone className="w-4 h-4 mr-1 text-blue-600" />
                        SMS
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    value={scheduledForm.template_content}
                    onChange={(e) => setScheduledForm({ ...scheduledForm, template_content: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Message content will be loaded from template"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingScheduled ? 'Update Message' : 'Schedule Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingScheduled(null);
                      setScheduledForm({
                        customer_id: '',
                        template_id: '',
                        recipient_name: '',
                        message_type: 'birthday',
                        scheduled_for: '',
                        message_method: 'whatsapp',
                        template_content: '',
                        recipient_phone: ''
                      });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Scheduled Messages List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled For
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduledLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">Loading scheduled messages...</td>
                    </tr>
                  ) : scheduledMessages?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No scheduled messages found</td>
                    </tr>
                  ) : (
                    scheduledMessages?.map((message) => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{message.recipient_name}</div>
                            <div className="text-sm text-gray-500">{message.recipient_phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {message.message_type?.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {message.message_method === 'whatsapp' ? (
                              <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                            ) : (
                              <Smartphone className="w-4 h-4 mr-1 text-blue-600" />
                            )}
                            <span className="text-sm text-gray-900 capitalize">{message.message_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(message.scheduled_for).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            message.status === 'Sent' 
                              ? 'bg-green-100 text-green-800'
                              : message.status === 'Scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditScheduled(message)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheduled(message.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Tab */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <form onSubmit={handleComposeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Type
                  </label>
                  <select
                    value={composeForm.message_type}
                    onChange={(e) => setComposeForm({ ...composeForm, message_type: e.target.value, template_id: '' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {messageTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select
                    value={composeForm.template_id}
                    onChange={(e) => setComposeForm({ ...composeForm, template_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Template</option>
                    {filteredTemplates.map(template => (
                      <option key={template.id} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients
                  </label>
                  <select
                    value={composeForm.recipients}
                    onChange={(e) => setComposeForm({ ...composeForm, recipients: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {recipientOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Method
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="whatsapp"
                        checked={composeForm.message_method === 'whatsapp'}
                        onChange={(e) => setComposeForm({ ...composeForm, message_method: e.target.value })}
                        className="mr-2"
                      />
                      <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                      WhatsApp
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="sms"
                        checked={composeForm.message_method === 'sms'}
                        onChange={(e) => setComposeForm({ ...composeForm, message_method: e.target.value })}
                        className="mr-2"
                      />
                      <Smartphone className="w-4 h-4 mr-1 text-blue-600" />
                      SMS
                    </label>
                  </div>
                </div>
              </div>

              {/* Message Content Preview */}
              {composeForm.template_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content Preview
                  </label>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm text-gray-700">
                    {templates?.find(t => t.id === composeForm.template_id)?.content || 'Select a template to preview content'}
                  </div>
                </div>
              )}

              {/* Send Options */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_now"
                    checked={composeForm.send_now}
                    onChange={(e) => setComposeForm({ ...composeForm, send_now: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="send_now" className="text-sm font-medium text-gray-700">
                    Send Now
                  </label>
                </div>
                {!composeForm.send_now && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule For
                    </label>
                    <input
                      type="datetime-local"
                      value={composeForm.scheduled_for}
                      onChange={(e) => setComposeForm({ ...composeForm, scheduled_for: e.target.value })}
                      className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!composeForm.send_now}
                    />
                  </div>
                )}
              </div>

              {/* Selected Customers Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Recipients ({selectedCustomers.length})
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {selectedCustomers.length === 0 ? (
                    <p className="text-sm text-gray-500">No customers match the selected criteria</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedCustomers.slice(0, 10).map(customer => (
                        <div key={customer.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-gray-500">{customer.phone}</span>
                        </div>
                      ))}
                      {selectedCustomers.length > 10 && (
                        <p className="text-sm text-gray-500 italic">
                          ... and {selectedCustomers.length - 10} more customers
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={selectedCustomers.length === 0 || !composeForm.template_id}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{composeForm.send_now ? 'Send Now' : 'Schedule Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}