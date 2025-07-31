'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SettingsData } from './types';
import { apiService } from './api';

interface SettingsContextType {
  settings: SettingsData | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateSettings: (data: Partial<SettingsData>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings - using defaults');
      // Set default settings as fallback
      setSettings({
        storeName: 'Birdnest Shop',
        storeEmail: 'admin@birdnest.com',
        storePhone: '',
        defaultLanguage: 'en',
        currency: 'VND',
        taxPercent: 0,
        freeShippingThreshold: 500000,
        enableStripe: true,
        enableMomo: true,
        enableCOD: true,
        maintenanceMode: false,
        logoUrl: '',
        address: '',
        country: 'Vietnam',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const updateSettings = async (data: Partial<SettingsData>) => {
    try {
      const updatedSettings = await apiService.updateSettings(data);
      setSettings(updatedSettings);
      
      // Refresh settings to ensure all components get the latest data
      await refreshSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook for getting specific setting values
export function useSetting<T extends keyof SettingsData>(key: T): SettingsData[T] | undefined {
  const { settings } = useSettings();
  return settings?.[key];
}

// Hook for checking if a feature is enabled
export function useFeatureEnabled(feature: 'stripe' | 'momo' | 'cod'): boolean {
  const { settings } = useSettings();
  if (!settings) return false;
  
  switch (feature) {
    case 'stripe':
      return settings.enableStripe;
    case 'momo':
      return settings.enableMomo;
    case 'cod':
      return settings.enableCOD;
    default:
      return false;
  }
}

// Hook for getting formatted currency
export function useCurrency() {
  const { settings } = useSettings();
  return settings?.currency || 'VND';
}

// Hook for getting tax percentage
export function useTaxPercent() {
  const { settings } = useSettings();
  return settings?.taxPercent || 0;
}

// Hook for getting free shipping threshold
export function useFreeShippingThreshold() {
  const { settings } = useSettings();
  return settings?.freeShippingThreshold || 0;
}

// Hook for checking maintenance mode
export function useMaintenanceMode() {
  const { settings } = useSettings();
  return settings?.maintenanceMode || false;
} 