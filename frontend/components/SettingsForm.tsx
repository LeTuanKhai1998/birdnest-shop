'use client';

import { useState, useEffect } from 'react';
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
  storeName: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự'),
  storeEmail: z.string().email('Địa chỉ email không hợp lệ'),
  storePhone: z.string().optional(),
  currency: z.string().min(1, 'Tiền tệ là bắt buộc'),
  taxPercent: z.number().min(0).max(100),
  freeShippingThreshold: z.number().min(0),
  enableStripe: z.boolean(),
  enableMomo: z.boolean(),
  enableCOD: z.boolean(),
  maintenanceMode: z.boolean(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: SettingsData;
  onSubmit: (data: SettingsFormData) => Promise<void>;
  isLoading?: boolean;
}

interface Province {
  code: string;
  name: string;
  districts: District[];
}

interface District {
  code: string;
  name: string;
  wards: Ward[];
}

interface Ward {
  code: string;
  name: string;
}

export function SettingsForm({ initialData, onSubmit, isLoading = false }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

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

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
      // Ensure dropdowns are set for province/district/ward after reset
      setTimeout(() => {
        if (initialData.province) {
          setValue('province', initialData.province, { shouldDirty: false });
        }
        if (initialData.district) {
          setValue('district', initialData.district, { shouldDirty: false });
        }
        if (initialData.ward) {
          setValue('ward', initialData.ward, { shouldDirty: false });
        }
      }, 100);
    }
  }, [initialData, reset, setValue]);

  const watchedValues = watch();

  // Load provinces data
  useEffect(() => {
    setLoadingProvinces(true);
    fetch('/lib/provinces-full.json')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => {
        setProvinces([]);
        console.error('Failed to load local provinces data:', err);
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Ensure dropdowns are set when provinces data is loaded
  useEffect(() => {
    if (!loadingProvinces && provinces.length > 0 && initialData) {
      // Set province dropdown
      if (initialData.province) {
        setValue('province', initialData.province, { shouldDirty: false });
      }
      // Set district dropdown
      if (initialData.district) {
        setValue('district', initialData.district, { shouldDirty: false });
      }
      // Set ward dropdown
      if (initialData.ward) {
        setValue('ward', initialData.ward, { shouldDirty: false });
      }
    }
  }, [loadingProvinces, provinces, initialData, setValue]);

  // Province/district/ward logic
  const provinceCode = watch('province');
  const districtCode = watch('district');
  const selectedProvince = provinces.find(
    (p) => String(p.code) === String(provinceCode),
  );
  const selectedDistrict = selectedProvince?.districts.find(
    (d) => String(d.code) === String(districtCode),
  );

  // Address change handlers
  const handleProvinceChange = (val: string) => {
    setValue('province', val, { shouldDirty: true });
    setValue('district', '', { shouldDirty: true });
    setValue('ward', '', { shouldDirty: true });
    setLoadingDistricts(true);
    setTimeout(() => setLoadingDistricts(false), 500);
  };

  const handleDistrictChange = (val: string) => {
    setValue('district', val, { shouldDirty: true });
    setValue('ward', '', { shouldDirty: true });
    setLoadingWards(true);
    setTimeout(() => setLoadingWards(false), 500);
  };

  // Track changes
  React.useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const handleFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      // Reset form with new data and ensure dropdowns are updated
      reset(data);
      setTimeout(() => {
        if (data.province) {
          setValue('province', data.province, { shouldDirty: false });
        }
        if (data.district) {
          setValue('district', data.district, { shouldDirty: false });
        }
        if (data.ward) {
          setValue('ward', data.ward, { shouldDirty: false });
        }
      }, 100);
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
          <div className="p-2 bg-[#a10000] rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#a10000]">Cấu hình cửa hàng</h2>
            <p className="text-sm text-gray-600">Quản lý cài đặt và tùy chọn cửa hàng</p>
          </div>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="text-orange-600 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Thay đổi chưa lưu
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-[#a10000]">
                  Cài đặt chung
                  <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                </CardTitle>
                <CardDescription>
                  Thông tin và cấu hình cơ bản của cửa hàng
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="flex items-center gap-2">
                  Tên cửa hàng
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
                  Email cửa hàng
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
            <div className="space-y-2">
              <Label htmlFor="storePhone">Số điện thoại cửa hàng</Label>
              <Input
                id="storePhone"
                {...register('storePhone')}
                placeholder="+84 123 456 789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-[#a10000]">Vị trí & Địa chỉ</CardTitle>
                <CardDescription>
                  Vị trí cửa hàng và thông tin liên hệ
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Tỉnh/thành phố</Label>
                <select
                  id="province"
                  {...register('province')}
                  value={watchedValues.province || ''}
                  disabled={loadingProvinces}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/huyện</Label>
                <select
                  id="district"
                  {...register('district')}
                  value={watchedValues.district || ''}
                  disabled={loadingDistricts || !selectedProvince}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                >
                  <option value="">Chọn quận/huyện</option>
                  {selectedProvince?.districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Phường/xã</Label>
                <select
                  id="ward"
                  {...register('ward')}
                  value={watchedValues.ward || ''}
                  disabled={loadingWards || !selectedDistrict}
                  onChange={(e) => {
                    setValue('ward', e.target.value, { shouldDirty: true });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                >
                  <option value="">Chọn phường/xã</option>
                  {selectedDistrict?.wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Đường/số nhà</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main Street, District 1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Order & Checkout Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-[#a10000]">Đơn hàng & Thanh toán</CardTitle>
                <CardDescription>
                  Cấu hình xử lý đơn hàng và cài đặt thanh toán
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  Tiền tệ
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
                <Label htmlFor="taxPercent">Phần trăm thuế (%)</Label>
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
                <Label htmlFor="freeShippingThreshold">Ngưỡng miễn phí vận chuyển</Label>
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
                Phương thức thanh toán
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">S</span>
                    </div>
                    <div>
                      <Label htmlFor="enableStripe" className="font-medium">Bật Stripe</Label>
                      <p className="text-sm text-gray-600">Thanh toán thẻ tín dụng quốc tế</p>
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
                      <Label htmlFor="enableMomo" className="font-medium">Bật MoMo</Label>
                      <p className="text-sm text-gray-600">Thanh toán di động Việt Nam</p>
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
                      <Label htmlFor="enableCOD" className="font-medium">Bật thanh toán khi nhận hàng</Label>
                      <p className="text-sm text-gray-600">Thanh toán khi nhận hàng</p>
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
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-[#a10000]">Cài đặt hệ thống</CardTitle>
                <CardDescription>
                  Cấu hình hệ thống nâng cao
                </CardDescription>
              </div>
            </div>
          </CardHeader>
                    <CardContent className="space-y-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL Logo</Label>
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
                      <Label htmlFor="maintenanceMode" className="font-medium">Chế độ bảo trì</Label>
                      <p className="text-sm text-gray-600">Tạm thời vô hiệu hóa cửa hàng</p>
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
            {hasChanges ? 'Bạn có thay đổi chưa lưu' : 'Tất cả thay đổi đã được lưu'}
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || isLoading}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                Đặt lại thay đổi
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !hasChanges}
              className="min-w-[120px] bg-[#a10000] hover:bg-red-800 hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 