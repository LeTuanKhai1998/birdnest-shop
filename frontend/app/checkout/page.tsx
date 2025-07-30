'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/lib/checkout-store';
import { CartItem } from '@/lib/cart-store';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Image from 'next/image';

import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  FileText,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useFeatureEnabled, useTaxPercent, useFreeShippingThreshold } from '@/lib/settings-context';
import { useCurrencyFormat, calculateTax, calculateTotalWithTax, qualifiesForFreeShipping, formatShippingCost } from '@/lib/currency-utils';

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

const schema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  addressMode: z.enum(['manual', 'map']),
  apartment: z.string().optional(),
  note: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'momo', 'cod']).optional(),
});

type FormData = z.infer<typeof schema>;

// Mock data for administrative selection
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

interface Address {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  apartment?: string;
  isDefault?: boolean;
  country?: string;
}

function getAddressDisplay(addr: Address, provinces: Province[]): string {
  const province =
    provinces.find((p: Province) => String(p.code) === String(addr.province))
      ?.name || '';
  const district =
    provinces
      .find((p: Province) => String(p.code) === String(addr.province))
      ?.districts.find(
        (d: District) => String(d.code) === String(addr.district),
      )?.name || '';
  const ward =
    provinces
      .find((p: Province) => String(p.code) === String(addr.province))
      ?.districts.find(
        (d: District) => String(d.code) === String(addr.district),
      )
      ?.wards.find((w: Ward) => String(w.code) === String(addr.ward))?.name ||
    '';
  return [addr.address, addr.apartment, ward, district, province]
    .filter(Boolean)
    .join(', ');
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: savedAddresses = [] } = useSWR(
    user ? '/api/addresses' : null,
    fetcher,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(
    savedAddresses.length > 0 ? savedAddresses[0].id : 'new',
  );
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 500000 ? 0 : 30000; // Free shipping over 500K VND
  const total = subtotal + shipping;
  
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      addressMode: 'manual',
      email: user?.email || '',
      paymentMethod: 'stripe',
    },
  });
  const [addressMode, setAddressMode] = useState<'manual' | 'map'>('manual');
  const [mockMarker, setMockMarker] = useState({ lat: 10.776, lng: 106.7 });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const setCheckoutInfo = useCheckoutStore((s) => s.setCheckoutInfo);
  const setProducts = useCheckoutStore((s) => s.setProducts);
  const setDeliveryFee = useCheckoutStore((s) => s.setDeliveryFee);
  const lastResetId = useRef<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    setLoadingProvinces(true);
    fetch('/lib/provinces-full.json')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((err: unknown) => {
        setProvinces([]);
        console.error('Failed to load local provinces data:', err);
      })
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Pre-fill form when address is selected
  useEffect(() => {
    if (loadingProvinces) return;
    if (selectedAddressId && selectedAddressId !== 'new') {
      if (lastResetId.current !== selectedAddressId) {
        const addr = savedAddresses.find(
          (a: Address) => a.id === selectedAddressId,
        );
        if (addr) {
          reset({
            fullName: addr.fullName,
            phone: addr.phone,
            email:
              addr.email && addr.email !== ''
                ? addr.email
                : (user?.email ?? ''),
            province: String(addr.province),
            district: String(addr.district),
            ward: String(addr.ward),
            address: addr.address,
            apartment: addr.apartment || '',
            addressMode: 'manual',
            note: '',
            paymentMethod: 'stripe',
          });
          setTimeout(() => {
            setValue('province', String(addr.province));
            setValue('district', String(addr.district));
            setValue('ward', String(addr.ward));
          }, 0);
          lastResetId.current = selectedAddressId;
        }
      }
    } else if (lastResetId.current !== 'new') {
      reset({
        fullName: '',
        phone: '',
        email: user?.email ?? '',
        province: '',
        district: '',
        ward: '',
        address: '',
        apartment: '',
        addressMode: 'manual',
        note: '',
        paymentMethod: 'stripe',
      });
      lastResetId.current = 'new';
    }
  }, [
    selectedAddressId,
    savedAddresses,
    loadingProvinces,
    reset,
    setValue,
    user?.email,
  ]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    // If user is logged in and selected 'new', auto-save address
    if (user && (selectedAddressId === 'new' || !selectedAddressId)) {
      try {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.fullName,
            phone: data.phone,
            province: String(data.province),
            district: String(data.district),
            ward: String(data.ward),
            address: data.address,
            apartment: data.apartment,
            country: 'Vietnam',
            isDefault: savedAddresses.length === 0,
          }),
        });
      } catch {
        /* ignore for now */
      }
    }
    setCheckoutInfo({ ...data, email: data.email ?? '' });
    setProducts(items as CartItem[]);
    setDeliveryFee(shipping);
    setTimeout(() => {
      setLoading(false);
      router.push('/payment');
    }, 1200);
  };

  // Register addressMode and set value on toggle
  const handleAddressModeChange = (mode: 'manual' | 'map') => {
    setAddressMode(mode);
    setValue('addressMode', mode);
  };

  // When province changes, reset district/ward
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('province', val);
    setValue('district', '');
    setValue('ward', '');
    setLoadingDistricts(true);
    setTimeout(() => setLoadingDistricts(false), 500);
  };
  
  // When district changes, reset ward
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('district', val);
    setValue('ward', '');
    setLoadingWards(true);
    setTimeout(() => setLoadingWards(false), 500);
  };

  const watchedAddress = watch('address');

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <Button asChild className="bg-[#a10000] hover:bg-red-800">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      <Toaster position="top-center" richColors />
      
      {/* Hero Section */}
      <section className="relative w-full bg-[#a10000] overflow-hidden" style={{ minHeight: '300px' }}>
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '300px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <MapPin className="w-8 h-8" />
              Thông Tin Giao Hàng
            </h1>
            <p className="text-lg md:text-xl mb-4">
              Nhập thông tin giao hàng của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Checkout Content Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit(onSubmit, (errors) => {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
                console.log(errors);
              })} className="space-y-6">
                
                {/* Customer Information */}
                <Card className="border-0 shadow-lg py-8">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                      <User className="w-5 h-5" />
                      Thông Tin Khách Hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-6 pb-6">
                    {!user && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                          <Link
                            href="/login?callbackUrl=/checkout"
                            className="text-[#a10000] hover:underline font-medium"
                          >
                            Đăng nhập
                          </Link>
                          {' '}để thanh toán nhanh hơn và lưu địa chỉ
                        </p>
                      </div>
                    )}
                    
                    {user && savedAddresses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Chọn địa chỉ đã lưu
                        </Label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                          {[...savedAddresses]
                            .sort(
                              (a, b) =>
                                (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0),
                            )
                            .map((a: Address) => (
                              <option key={a.id} value={a.id}>
                                {getAddressDisplay(a, provinces)}
                                {a.isDefault ? ' (Mặc định)' : ''}
                              </option>
                            ))}
                          <option value="new">Thêm địa chỉ mới</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Họ và tên *
                        </Label>
                        <Input 
                          id="fullName" 
                          {...register('fullName')} 
                          className="h-12"
                          placeholder="Nhập họ và tên"
                        />
                        {errors.fullName && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Số điện thoại *
                        </Label>
                        <Input 
                          id="phone" 
                          {...register('phone')} 
                          className="h-12"
                          placeholder="Nhập số điện thoại"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email (tùy chọn)
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email')} 
                        className="h-12"
                        placeholder="Nhập email"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="border-0 shadow-lg py-8">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                      <MapPin className="w-5 h-5" />
                      Địa Chỉ Giao Hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-6 pb-6">
                    {/* Address Mode Toggle */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Chọn cách nhập địa chỉ
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            addressMode === 'manual' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handleAddressModeChange('manual')}
                          className={addressMode === 'manual' ? 'bg-[#a10000] hover:bg-red-800' : ''}
                        >
                          Nhập thủ công
                        </Button>
                        <Button
                          type="button"
                          variant={addressMode === 'map' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAddressModeChange('map')}
                          className={addressMode === 'map' ? 'bg-[#a10000] hover:bg-red-800' : ''}
                        >
                          Chọn trên bản đồ
                        </Button>
                        <input type="hidden" {...register('addressMode')} />
                      </div>
                    </div>
                    
                    {addressMode === 'manual' ? (
                      <div className="space-y-4">
                        {/* Province dropdown */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Tỉnh/Thành phố *
                          </Label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-12 text-sm focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                            {...register('province')}
                            onChange={handleProvinceChange}
                            disabled={loadingProvinces}
                          >
                            <option value="">
                              {loadingProvinces
                                ? 'Đang tải...'
                                : 'Chọn tỉnh/thành phố'}
                            </option>
                            {provinces.map((p) => (
                              <option key={p.code} value={String(p.code)}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          {errors.province && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.province.message}
                            </p>
                          )}
                        </div>
                        
                        {/* District dropdown */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Quận/Huyện *
                          </Label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-12 text-sm focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                            {...register('district')}
                            onChange={handleDistrictChange}
                            disabled={!watch('province') || loadingDistricts}
                          >
                            <option value="">
                              {loadingDistricts
                                ? 'Đang tải...'
                                : 'Chọn quận/huyện'}
                            </option>
                            {watch('province') &&
                              !loadingDistricts &&
                              provinces
                                .find(
                                  (p) =>
                                    String(p.code) ===
                                    String(watch('province')),
                                )
                                ?.districts.map((d: District) => (
                                  <option key={d.code} value={String(d.code)}>
                                    {d.name}
                                  </option>
                                ))}
                          </select>
                          {errors.district && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.district.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Ward dropdown */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Phường/Xã *
                          </Label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-12 text-sm focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                            {...register('ward')}
                            onChange={(e) => setValue('ward', e.target.value)}
                            disabled={!watch('district') || loadingWards}
                          >
                            <option value="">
                              {loadingWards
                                ? 'Đang tải...'
                                : 'Chọn phường/xã'}
                            </option>
                            {watch('province') &&
                              watch('district') &&
                              !loadingWards &&
                              provinces
                                .find(
                                  (p) =>
                                    String(p.code) ===
                                    String(watch('province')),
                                )
                                ?.districts.find(
                                  (d: District) =>
                                    String(d.code) ===
                                    String(watch('district')),
                                )
                                ?.wards.map((w: Ward) => (
                                  <option key={w.code} value={String(w.code)}>
                                    {w.name}
                                  </option>
                                ))}
                          </select>
                          {errors.ward && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.ward.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Street address */}
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                            Địa chỉ chi tiết *
                          </Label>
                          <Input
                            id="address"
                            placeholder="Nhập số nhà, tên đường..."
                            autoComplete="off"
                            {...register('address')}
                            className="h-12"
                          />
                          {errors.address && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.address.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Apartment */}
                        <div className="space-y-2">
                          <Label htmlFor="apartment" className="text-sm font-medium text-gray-700">
                            Căn hộ/Phòng (tùy chọn)
                          </Label>
                          <Input 
                            id="apartment" 
                            {...register('apartment')} 
                            className="h-12"
                            placeholder="Nhập số căn hộ/phòng"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center relative border">
                          {/* Mock map with marker */}
                          <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            onClick={() =>
                              setMockMarker({
                                lat: mockMarker.lat + 0.001,
                                lng: mockMarker.lng + 0.001,
                              })
                            }
                          >
                            <svg
                              width="32"
                              height="32"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              className="text-[#a10000]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21c-4-4-7-7-7-11a7 7 0 1 1 14 0c0 4-3 7-7 11z"
                              />
                              <circle cx="12" cy="10" r="3" fill="currentColor" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400 absolute bottom-2 left-2">
                            (Bản đồ mô phỏng, click để di chuyển)
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Note */}
                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                        Ghi chú (tùy chọn)
                      </Label>
                      <Textarea 
                        id="note" 
                        rows={3} 
                        {...register('note')} 
                        placeholder="Ghi chú về đơn hàng..."
                      />
                    </div>
                  </CardContent>
                </Card>



                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-[#a10000] hover:bg-red-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Tiếp tục đến thanh toán'
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-0 shadow-lg py-8">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-[#a10000]">
                    <FileText className="w-5 h-5" />
                    Tóm Tắt Đơn Hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <div className="relative w-full h-full rounded-lg bg-gray-50 border overflow-hidden">
                            <Image
                              src={
                                product.image ||
                                (product.images && product.images[0]) ||
                                '/images/placeholder-product.jpg'
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-2">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {product.weight}g
                            </Badge>
                            <span className="text-xs text-gray-500">x{quantity}</span>
                          </div>
                        </div>
                        <div className="font-semibold text-[#a10000] text-sm">
                          {currencyFormatter.format(product.price * quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">{currencyFormatter.format(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Miễn phí
                          </span>
                        ) : (
                          currencyFormatter.format(shipping)
                        )}
                      </span>
                    </div>
                    
                    {shipping > 0 && (
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        <Truck className="w-3 h-3 inline mr-1" />
                        Mua thêm {currencyFormatter.format(500000 - subtotal)} để được miễn phí vận chuyển
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-[#a10000]">{currencyFormatter.format(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
