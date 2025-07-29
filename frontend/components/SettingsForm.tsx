'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings, 
  Store, 
  MapPin, 
  CreditCard, 
  Shield, 
  Save,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsData } from '@/lib/types';
import React from 'react';

const settingsSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeEmail: z.string().email('Invalid email address'),
  storePhone: z.string().optional(),
  defaultLanguage: z.enum(['en', 'vi']),
  currency: z.string().min(1, 'Currency is required'),
  taxPercent: z.number().min(0).max(100),
  freeShippingThreshold: z.number().min(0),
  enableStripe: z.boolean(),
  enableMomo: z.boolean(),
  enableCOD: z.boolean(),
  maintenanceMode: z.boolean(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SettingsData;
  onSubmit: (data: SettingsFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsForm({ initialData, onSubmit, isLoading = false }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const watchedValues = watch();

  // Track changes
  React.useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const handleFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset(data); // Reset form with new data
      setHasChanges(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset(initialData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Store Configuration</h2>
            <p className="text-sm text-gray-600">Manage your store settings and preferences</p>
          </div>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="text-orange-600 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  General Settings
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                </CardTitle>
                <CardDescription>
                  Basic store information and configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="flex items-center gap-2">
                  Store Name
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="storeName"
                  {...register('storeName')}
                  placeholder="Birdnest Shop"
                  className={errors.storeName ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.storeName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.storeName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="flex items-center gap-2">
                  Store Email
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="storeEmail"
                  type="email"
                  {...register('storeEmail')}
                  placeholder="admin@birdnest.com"
                  className={errors.storeEmail ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.storeEmail && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.storeEmail.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  {...register('storePhone')}
                  placeholder="+84 123 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  {...register('defaultLanguage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="vi">🇻🇳 Vietnamese</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Location & Address</CardTitle>
                <CardDescription>
                  Store location and contact information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="123 Main Street, District 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="Vietnam"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order & Checkout Settings */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Order & Checkout</CardTitle>
                <CardDescription>
                  Configure order processing and payment settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  Currency
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currency"
                  {...register('currency')}
                  placeholder="VND"
                  className={errors.currency ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.currency && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.currency.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxPercent">Tax Percentage (%)</Label>
                <Input
                  id="taxPercent"
                  type="number"
                  step="0.01"
                  {...register('taxPercent', { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.taxPercent ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.taxPercent && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.taxPercent.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  {...register('freeShippingThreshold', { valueAsNumber: true })}
                  placeholder="500000"
                  className={errors.freeShippingThreshold ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.freeShippingThreshold && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.freeShippingThreshold.message}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">S</span>
                    </div>
                    <div>
                      <Label htmlFor="enableStripe" className="font-medium">Enable Stripe</Label>
                      <p className="text-sm text-gray-600">International credit card payments</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="enableStripe"
                    checked={watchedValues.enableStripe}
                    onChange={(e) => setValue('enableStripe', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-pink-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-pink-600">M</span>
                    </div>
                    <div>
                      <Label htmlFor="enableMomo" className="font-medium">Enable MoMo</Label>
                      <p className="text-sm text-gray-600">Vietnamese mobile payment</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="enableMomo"
                    checked={watchedValues.enableMomo}
                    onChange={(e) => setValue('enableMomo', e.target.checked)}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">C</span>
                    </div>
                    <div>
                      <Label htmlFor="enableCOD" className="font-medium">Enable Cash on Delivery</Label>
                      <p className="text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="enableCOD"
                    checked={watchedValues.enableCOD}
                    onChange={(e) => setValue('enableCOD', e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Advanced system configuration
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-red-100 rounded flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Temporarily disable the store</p>
                </div>
              </div>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={watchedValues.maintenanceMode}
                onChange={(e) => setValue('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || isLoading}
              >
                Reset Changes
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !hasChanges}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 