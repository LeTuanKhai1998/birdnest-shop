'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsForm } from '@/components/SettingsForm';
import { apiService } from '@/lib/api';
import { SettingsData } from '@/lib/types';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
      router.push('/admin/login');
      return;
    }

    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SettingsData) => {
    try {
      setLoading(true);
      const updatedSettings = await apiService.updateSettings(data);
      setSettings(updatedSettings);
      
      // Show success message (you could add a toast notification here)
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadSettings}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No settings found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your store settings, payment methods, and system preferences.
          </p>
        </div>

        <SettingsForm
          initialData={settings}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
} 