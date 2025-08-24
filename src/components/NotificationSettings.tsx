import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Calendar,
  Filter,
  Gift,
  CreditCard,
  Save,
} from 'lucide-react';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export function NotificationSettings() {
  const { settings, loading, error, updateSetting } = useNotificationSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Initialize local settings when database settings load
  React.useEffect(() => {
    if (Object.keys(settings).length > 0) {
      const initialized = Object.keys(settings).reduce((acc, key) => {
        acc[key] = {
          enabled: settings[key].enabled,
          ...settings[key].configuration,
        };
        return acc;
      }, {} as Record<string, any>);
      setLocalSettings(initialized);
    }
  }, [settings]);

  const updateLocalSetting = (category: string, key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      for (const [settingType, config] of Object.entries(localSettings)) {
        const { enabled, ...configuration } = config;
        await updateSetting(settingType, enabled, configuration);
      }
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading settings...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">
          Notification Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure automated message preferences and timing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Birthday Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-pink-500 rounded-lg p-2">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Birthday Messages
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable birthday messages
              </label>
              <input
                type="checkbox"
                checked={localSettings.birthday?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('birthday', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
              />
            </div>

            {localSettings.birthday?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send time
                  </label>
                  <input
                    type="time"
                    value={localSettings.birthday?.time}
                    onChange={(e) =>
                      updateLocalSetting('birthday', 'time', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days before birthday
                  </label>
                  <select
                    value={localSettings.birthday?.daysBefore}
                    onChange={(e) =>
                      updateLocalSetting(
                        'birthday',
                        'daysBefore',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value={0}>On birthday</option>
                    <option value={1}>1 day before</option>
                    <option value={3}>3 days before</option>
                    <option value={7}>1 week before</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Welcome Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-500 rounded-lg p-2">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Welcome Messages
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable welcome messages
              </label>
              <input
                type="checkbox"
                checked={localSettings.welcome?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('welcome', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
            </div>

            {localSettings.welcome?.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Send immediately
                  </label>
                  <input
                    type="checkbox"
                    checked={localSettings.welcome?.immediate || false}
                    onChange={(e) =>
                      updateLocalSetting(
                        'welcome',
                        'immediate',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Send follow-up message
                  </label>
                  <input
                    type="checkbox"
                    checked={localSettings.welcome?.followUp || false}
                    onChange={(e) =>
                      updateLocalSetting(
                        'welcome',
                        'followUp',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>

                {localSettings.welcome?.followUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up after (days)
                    </label>
                    <input
                      type="number"
                      value={localSettings.welcome?.followUpDays || 7}
                      onChange={(e) =>
                        updateLocalSetting(
                          'welcome',
                          'followUpDays',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Guarantee Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-500 rounded-lg p-2">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Guarantee Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable guarantee notifications
              </label>
              <input
                type="checkbox"
                checked={localSettings.guarantee?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('guarantee', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>

            {localSettings.guarantee?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder schedule (days before expiry)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[30, 15, 7, 3, 1].map((days) => (
                      <label key={days} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={
                            localSettings.guarantee?.reminderDays?.includes(
                              days
                            ) || false
                          }
                          onChange={(e) => {
                            const currentDays =
                              localSettings.guarantee?.reminderDays || [];
                            if (e.target.checked) {
                              updateLocalSetting('guarantee', 'reminderDays', [
                                ...currentDays,
                                days,
                              ]);
                            } else {
                              updateLocalSetting(
                                'guarantee',
                                'reminderDays',
                                currentDays.filter((d: number) => d !== days)
                              );
                            }
                          }}
                          className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{days}d</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Notify after expiry
                  </label>
                  <input
                    type="checkbox"
                    checked={
                      localSettings.guarantee?.expiredNotification || false
                    }
                    onChange={(e) =>
                      updateLocalSetting(
                        'guarantee',
                        'expiredNotification',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter Change Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-500 rounded-lg p-2">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Filter Change Reminders
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable filter reminders
              </label>
              <input
                type="checkbox"
                checked={localSettings.filter?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('filter', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {localSettings.filter?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder schedule (days before due)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[14, 7, 3, 1].map((days) => (
                      <label key={days} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={
                            localSettings.filter?.reminderDays?.includes(
                              days
                            ) || false
                          }
                          onChange={(e) => {
                            const currentDays =
                              localSettings.filter?.reminderDays || [];
                            if (e.target.checked) {
                              updateLocalSetting('filter', 'reminderDays', [
                                ...currentDays,
                                days,
                              ]);
                            } else {
                              updateLocalSetting(
                                'filter',
                                'reminderDays',
                                currentDays.filter((d: number) => d !== days)
                              );
                            }
                          }}
                          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{days}d</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Allow custom intervals
                  </label>
                  <input
                    type="checkbox"
                    checked={localSettings.filter?.customIntervals || false}
                    onChange={(e) =>
                      updateLocalSetting(
                        'filter',
                        'customIntervals',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Promotional Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-500 rounded-lg p-2">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Promotional Messages
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable promotional messages
              </label>
              <input
                type="checkbox"
                checked={localSettings.promotional?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('promotional', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
            </div>

            {localSettings.promotional?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={localSettings.promotional?.frequency || 'weekly'}
                    onChange={(e) =>
                      updateLocalSetting(
                        'promotional',
                        'frequency',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Festival messages
                  </label>
                  <input
                    type="checkbox"
                    checked={localSettings.promotional?.festivals || false}
                    onChange={(e) =>
                      updateLocalSetting(
                        'promotional',
                        'festivals',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loan Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-teal-500 rounded-lg p-2">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Loan Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable loan notifications
              </label>
              <input
                type="checkbox"
                checked={localSettings.loan?.enabled || false}
                onChange={(e) =>
                  updateLocalSetting('loan', 'enabled', e.target.checked)
                }
                className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
              />
            </div>

            {localSettings.loan?.enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder frequency
                </label>
                <select
                  value={localSettings.loan?.reminderFrequency || 'monthly'}
                  onChange={(e) =>
                    updateLocalSetting(
                      'loan',
                      'reminderFrequency',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
