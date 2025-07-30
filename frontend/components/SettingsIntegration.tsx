'use client';

import { useSettings, useFeatureEnabled, useTaxPercent, useFreeShippingThreshold } from '@/lib/settings-context';
import { useCurrencyFormat, formatCurrency, calculateTax, calculateTotalWithTax, qualifiesForFreeShipping } from '@/lib/currency-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Truck, 
  Settings, 
  CheckCircle, 
  XCircle,
  Info
} from 'lucide-react';

// Example component showing how to use settings in different parts of the app
export function SettingsIntegration() {
  const { settings, loading } = useSettings();
  const { format, currency } = useCurrencyFormat();
  const taxPercent = useTaxPercent();
  const freeShippingThreshold = useFreeShippingThreshold();
  
  // Check which payment methods are enabled
  const stripeEnabled = useFeatureEnabled('stripe');
  const momoEnabled = useFeatureEnabled('momo');
  const codEnabled = useFeatureEnabled('cod');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Settings not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Example calculations
  const sampleOrderTotal = 750000; // 750,000 VND
  const taxAmount = calculateTax(sampleOrderTotal, taxPercent);
  const totalWithTax = calculateTotalWithTax(sampleOrderTotal, taxPercent);
  const qualifiesForFreeShippingOrder = qualifiesForFreeShipping(sampleOrderTotal, freeShippingThreshold);

  return (
    <div className="space-y-6">
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Store Settings Overview
          </CardTitle>
          <CardDescription>
            Current configuration applied across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Store Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {settings.storeName}</p>
                <p><strong>Email:</strong> {settings.storeEmail}</p>
                {settings.storePhone && (
                  <p><strong>Phone:</strong> {settings.storePhone}</p>
                )}
                <p><strong>Language:</strong> {settings.defaultLanguage === 'en' ? 'English' : 'Vietnamese'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <div className="space-y-1 text-sm">
                {settings.address && <p><strong>Address:</strong> {settings.address}</p>}
                {settings.country && <p><strong>Country:</strong> {settings.country}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Available payment options for customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Stripe</span>
              </div>
              {stripeEnabled ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-pink-600" />
                <span>MoMo</span>
              </div>
              {momoEnabled ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Cash on Delivery</span>
              </div>
              {codEnabled ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Shipping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing & Shipping Configuration
          </CardTitle>
          <CardDescription>
            Currency, tax, and shipping settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Currency</h4>
              <p className="text-2xl font-bold text-blue-600">{currency}</p>
              <p className="text-sm text-gray-600">Store currency</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Tax Rate</h4>
              <p className="text-2xl font-bold text-orange-600">{taxPercent}%</p>
              <p className="text-sm text-gray-600">Applied to orders</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Free Shipping</h4>
              <p className="text-2xl font-bold text-green-600">{format(freeShippingThreshold)}</p>
              <p className="text-sm text-gray-600">Minimum order value</p>
            </div>
          </div>

          {/* Example Order Calculation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Example Order Calculation
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order Subtotal:</span>
                <span>{format(sampleOrderTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxPercent}%):</span>
                <span>{format(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="flex items-center gap-1">
                  {qualifiesForFreeShippingOrder ? (
                    <>
                      <Truck className="w-4 h-4 text-green-600" />
                      Free
                    </>
                  ) : (
                    format(50000) // Example shipping cost
                  )}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{format(totalWithTax)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <span>Maintenance Mode</span>
            </div>
            {settings.maintenanceMode ? (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for easy access to common settings
export function useStoreSettings() {
  const { settings, loading } = useSettings();
  const { format } = useCurrencyFormat();
  
  return {
    settings,
    loading,
    format,
    storeName: settings?.storeName || 'Birdnest Shop',
    storeEmail: settings?.storeEmail || 'admin@birdnest.com',
    currency: settings?.currency || 'VND',
    taxPercent: settings?.taxPercent || 0,
    freeShippingThreshold: settings?.freeShippingThreshold || 0,
    maintenanceMode: settings?.maintenanceMode || false,
    stripeEnabled: settings?.enableStripe || false,
    momoEnabled: settings?.enableMomo || false,
    codEnabled: settings?.enableCOD || false,
  };
} 