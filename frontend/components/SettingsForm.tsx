'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SettingsData } from '@/lib/types';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Basic store information and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                {...register('storeName')}
                placeholder="Birdnest Shop"
              />
              {errors.storeName && (
                <p className="text-sm text-red-600">{errors.storeName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input
                id="storeEmail"
                type="email"
                {...register('storeEmail')}
                placeholder="admin@birdnest.com"
              />
              {errors.storeEmail && (
                <p className="text-sm text-red-600">{errors.storeEmail.message}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Address</CardTitle>
          <CardDescription>
            Store location and contact information
          </CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Order & Checkout</CardTitle>
          <CardDescription>
            Configure order processing and payment settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register('currency')}
                placeholder="VND"
              />
              {errors.currency && (
                <p className="text-sm text-red-600">{errors.currency.message}</p>
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
              />
              {errors.taxPercent && (
                <p className="text-sm text-red-600">{errors.taxPercent.message}</p>
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
              />
              {errors.freeShippingThreshold && (
                <p className="text-sm text-red-600">{errors.freeShippingThreshold.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Payment Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableStripe">Enable Stripe</Label>
                  <p className="text-sm text-gray-600">International credit card payments</p>
                </div>
                <Switch
                  id="enableStripe"
                  checked={watchedValues.enableStripe}
                  onCheckedChange={(checked) => setValue('enableStripe', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableMomo">Enable MoMo</Label>
                  <p className="text-sm text-gray-600">Vietnamese mobile payment</p>
                </div>
                <Switch
                  id="enableMomo"
                  checked={watchedValues.enableMomo}
                  onCheckedChange={(checked) => setValue('enableMomo', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCOD">Enable Cash on Delivery</Label>
                  <p className="text-sm text-gray-600">Pay when you receive</p>
                </div>
                <Switch
                  id="enableCOD"
                  checked={watchedValues.enableCOD}
                  onCheckedChange={(checked) => setValue('enableCOD', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Advanced system configuration
          </CardDescription>
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
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-gray-600">Temporarily disable the store</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={watchedValues.maintenanceMode}
              onCheckedChange={(checked) => setValue('maintenanceMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
} 