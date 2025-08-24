import { useState, useEffect } from 'react';
import { supabase, NotificationSetting } from '../lib/supabase';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<Record<string, NotificationSetting>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_type] = setting;
        return acc;
      }, {} as Record<string, NotificationSetting>);

      setSettings(settingsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (
    settingType: string,
    enabled: boolean,
    configuration: Record<string, any>
  ) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            setting_type: settingType,
            enabled,
            configuration,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'setting_type' } // Tell the DB to handle conflicts on this column
        )
        .select()
        .single();

      if (error) throw error;

      setSettings((prev) => ({
        ...prev,
        [settingType]: data,
      }));

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    refetch: fetchSettings,
  };
}
