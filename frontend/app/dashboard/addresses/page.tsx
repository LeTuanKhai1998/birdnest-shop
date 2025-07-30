'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOrEmpty } from '@/components/ui/LoadingOrEmpty';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Star, StarOff, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Họ tên là bắt buộc'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại Việt Nam không hợp lệ'),
  province: z.string().min(1, 'Tỉnh/thành phố là bắt buộc'),
  district: z.string().min(1, 'Quận/huyện là bắt buộc'),
  ward: z.string().min(1, 'Phường/xã là bắt buộc'),
  address: z.string().min(5, 'Đường/số nhà là bắt buộc'),
  apartment: z.string().optional(),
  country: z.string().min(2, 'Quốc gia là bắt buộc'),
  isDefault: z.boolean().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

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

function fetcher(url: string): Promise<Address[]> {
  return fetch(url).then((r) => r.json());
}

function getLine1(addr: Address): string {
  return [addr.address, addr.apartment].filter(Boolean).join(', ');
}
function getLine2(addr: Address, provinces: Province[]): string {
  const province =
    provinces.find((p) => String(p.code) === String(addr.province))?.name || '';
  const district =
    provinces
      .find((p) => String(p.code) === String(addr.province))
      ?.districts.find((d) => String(d.code) === String(addr.district))?.name ||
    '';
  const ward =
    provinces
      .find((p) => String(p.code) === String(addr.province))
      ?.districts.find((d) => String(d.code) === String(addr.district))
      ?.wards.find((w) => String(w.code) === String(addr.ward))?.name || '';
  return [ward, district, province].filter(Boolean).join(', ');
}

export default function AddressesPage() {
  // Check for localStorage authentication (admin users)
  const [localUser, setLocalUser] = useState<{ id: string; email: string; name: string; isAdmin: boolean } | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setLocalUser(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);
  
  // Use backend API for admin users, frontend API for regular users
  const isAdminUser = !!localUser;
  const apiEndpoint = isAdminUser ? 'http://localhost:8080/api/addresses' : '/api/addresses';
  
  const { data: addressesData, isLoading, mutate } = useSWR(
    apiEndpoint,
    async (url: string) => {
      if (isAdminUser) {
        // Use JWT token for backend API
        const token = localStorage.getItem('auth-token');
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch addresses');
        return response.json();
      } else {
        // Use regular fetcher for frontend API
        return fetcher(url);
      }
    },
  );
  
  // Ensure addresses is always an array and handle edge cases
  const addresses = Array.isArray(addressesData) ? addressesData : [];
  
  // Safety check: if addresses is not an array, show error or loading
  if (!Array.isArray(addressesData) && addressesData !== undefined) {
    console.error('Addresses data is not an array:', addressesData);
  }
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const editing = editId
    ? addresses.find((a: Address) => a.id === editId)
    : null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: editing || { country: 'Vietnam', isDefault: false },
  });

  // Province/district/ward logic
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



  const provinceCode = watch('province');
  const districtCode = watch('district');
  const selectedProvince = provinces.find(
    (p) => String(p.code) === String(provinceCode),
  );
  const selectedDistrict = selectedProvince?.districts.find(
    (d) => String(d.code) === String(districtCode),
  );

  // Reset form when editing changes
  useEffect(() => {
    if (editing) {
      reset({
        ...editing,
        province: String(editing.province),
        district: String(editing.district),
        ward: String(editing.ward),
      });
      // Ensure dropdowns are set for province/district/ward
      setTimeout(() => {
        setValue('province', String(editing.province));
        setValue('district', String(editing.district));
        setValue('ward', String(editing.ward));
      }, 0);
    } else {
      reset({ country: 'Vietnam', isDefault: false });
    }
  }, [editing, reset, setValue]);

  // Create or update address
  async function onSubmit(data: AddressForm) {
    if (!data.province || !data.district || !data.ward) {
      toast.error('Please select province, district, and ward.');
      return;
    }
    setSaving(true);
    try {
      // Ensure district and ward are saved as strings
      const cleanData = {
        ...data,
        province: String(data.province),
        district: String(data.district),
        ward: String(data.ward),
      };
      const method = editing ? 'PATCH' : 'POST';
      const body = editing ? cleanData : cleanData;
      
      let endpoint = isAdminUser ? 'http://localhost:8080/api/addresses' : '/api/addresses';
      if (editing) {
        endpoint += `/${editing.id}`;
      }
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        const token = localStorage.getItem('auth-token');
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || 'Failed to save address');
      
      // Update local state with optimistic updates
      if (isAdminUser) {
        // Store original data for rollback
        const originalData = addresses;
        
        // Safety check: ensure addresses is an array
        if (!Array.isArray(addresses)) {
          console.error('Addresses is not an array:', addresses);
          toast.error('Error: Invalid data format');
          return;
        }
        
        // For admin users, use optimistic updates
        const optimisticData = editing 
          ? addresses.map((addr: Address) => 
              addr.id === editing.id 
                ? { ...addr, ...cleanData, updatedAt: new Date().toISOString() }
                : addr
            )
          : [...addresses, { 
              id: `temp-${Date.now()}`, 
              ...cleanData, 
              userId: localUser.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }];
        
        // Optimistically update the UI
        mutate(optimisticData, false);
        toast.success(editing ? 'Address updated!' : 'Address added!');
        
        // Revalidate data from server (this will rollback if there's an error)
        mutate().catch(() => {
          // If revalidation fails, rollback to original data
          mutate(originalData, false);
          toast.error('Failed to save changes. Please try again.');
        });
      } else {
        mutate('/api/addresses');
        toast.success(editing ? 'Address updated!' : 'Address added!');
      }
      
      setShowForm(false);
      setEditId(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setSaving(false);
    }
  }

  // Delete address
  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const endpoint = `${isAdminUser ? 'http://localhost:8080/api/addresses' : '/api/addresses'}/${id}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        const token = localStorage.getItem('auth-token');
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok)
        throw new Error((await res.json()).error || 'Failed to delete address');
      
      // Update local state with optimistic updates
      if (isAdminUser) {
        // Store original data for rollback
        const originalData = addresses;
        
        // Safety check: ensure addresses is an array
        if (!Array.isArray(addresses)) {
          console.error('Addresses is not an array:', addresses);
          toast.error('Error: Invalid data format');
          return;
        }
        
        // For admin users, use optimistic updates
        const optimisticData = addresses.filter((addr: Address) => addr.id !== id);
        
        // Optimistically update the UI
        mutate(optimisticData, false);
        toast.success('Address deleted!');
        
        // Revalidate data from server (this will rollback if there's an error)
        mutate().catch(() => {
          // If revalidation fails, rollback to original data
          mutate(originalData, false);
          toast.error('Failed to delete address. Please try again.');
        });
      } else {
        mutate('/api/addresses');
        toast.success('Address deleted!');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setDeleting(null);
    }
  }

  // Set as default
  async function handleSetDefault(id: string) {
    try {
      // Safety check: ensure addresses is an array
      if (!Array.isArray(addresses)) {
        console.error('Addresses is not an array:', addresses);
        toast.error('Error: Invalid data format');
        return;
      }
      
      const addr = addresses.find((a: Address) => a.id === id);
      if (!addr) return;
      
      const endpoint = `${isAdminUser ? 'http://localhost:8080/api/addresses' : '/api/addresses'}/${id}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      if (isAdminUser) {
        const token = localStorage.getItem('auth-token');
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...addr, isDefault: true }),
      });
      
      // Update local state with optimistic updates
      if (isAdminUser) {
        // Store original data for rollback
        const originalData = addresses;
        
        // Safety check: ensure addresses is an array
        if (!Array.isArray(addresses)) {
          console.error('Addresses is not an array:', addresses);
          toast.error('Error: Invalid data format');
          return;
        }
        
        // For admin users, use optimistic updates
        const optimisticData = addresses.map((addr: Address) => ({
          ...addr,
          isDefault: addr.id === id
        }));
        
        // Optimistically update the UI
        mutate(optimisticData, false);
        toast.success('Default address set!');
        
        // Revalidate data from server (this will rollback if there's an error)
        mutate().catch(() => {
          // If revalidation fails, rollback to original data
          mutate(originalData, false);
          toast.error('Failed to set default address. Please try again.');
        });
      } else {
        mutate('/api/addresses');
        toast.success('Default address set!');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  }

  // Province/district/ward change handlers
  const handleProvinceChange = (val: string) => {
    setValue('province', val);
    setValue('district', '');
    setValue('ward', '');
    setLoadingDistricts(true);
    setTimeout(() => setLoadingDistricts(false), 500);
  };
  const handleDistrictChange = (val: string) => {
    setValue('district', val);
    setValue('ward', '');
    setLoadingWards(true);
    setTimeout(() => setLoadingWards(false), 500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 
          className="text-glossy text-3xl md:text-5xl font-black italic"
          style={{
            fontWeight: 900,
            fontStyle: 'italic',
            fontFamily: 'Inter, sans-serif',
            fontSize: '3.3rem',
            padding: '20px',
            color: '#a10000'
          }}
        >
          Địa chỉ của tôi
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Quản lý địa chỉ giao hàng và thanh toán của bạn
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#a10000]">Danh sách địa chỉ</h2>
          <Button
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
            className="bg-[#a10000] hover:bg-red-800"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ
          </Button>
        </div>
        <LoadingOrEmpty
          loading={isLoading}
          empty={addresses.length === 0}
          emptyText="Chưa có địa chỉ nào được lưu."
        >
          <div className="flex flex-col gap-4">
            {addresses.map((addr: Address) => (
              <Card
                key={addr.id}
                className={`relative p-4 flex flex-col md:flex-row md:items-center gap-2 border ${addr.isDefault ? 'border-[#a10000]' : 'border-gray-200'}`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-base flex items-center gap-2">
                    {addr.fullName}
                    {addr.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-[#a10000]/10 text-[#a10000] rounded ml-2">
                        <Star className="w-4 h-4 mr-1" /> Mặc định
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">{addr.phone}</div>
                  <div className="text-gray-700 text-sm mt-1">
                    <div>{getLine1(addr)}</div>
                    <div>{getLine2(addr, provinces)}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Đặt làm mặc định"
                      onClick={() => handleSetDefault(addr.id)}
                      className="hover:bg-[#a10000]/10 hover:text-[#a10000]"
                    >
                      <StarOff className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Chỉnh sửa"
                    onClick={() => {
                      setEditId(addr.id);
                      setShowForm(true);
                    }}
                    className="hover:bg-[#a10000]/10 hover:text-[#a10000]"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Xóa"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleting === addr.id}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </LoadingOrEmpty>
        {/* Address Form Modal/Inline */}
        {showForm && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative animate-in fade-in zoom-in-95">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-semibold mb-4 text-[#a10000]">
                {editing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'}
              </h3>
              <form
                className="grid grid-cols-1 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="fullName"
                  >
                    Họ tên
                  </label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Họ tên"
                    required
                    disabled={saving}
                  />
                  {errors.fullName && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.fullName.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="phone"
                  >
                    Số điện thoại
                  </label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="Số điện thoại"
                    required
                    disabled={saving}
                  />
                  {errors.phone && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="country"
                  >
                    Quốc gia
                  </label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Quốc gia"
                    required
                    disabled={saving}
                  />
                  {errors.country && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.country.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="province"
                  >
                    Tỉnh/thành phố
                  </label>
                  <select
                    id="province"
                    {...register('province')}
                    disabled={saving || loadingProvinces}
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
                  {errors.province && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.province.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="district"
                  >
                    Quận/huyện
                  </label>
                  <select
                    id="district"
                    {...register('district')}
                    disabled={saving || loadingDistricts || !selectedProvince}
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
                  {errors.district && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.district.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="ward"
                  >
                    Phường/xã
                  </label>
                  <select
                    id="ward"
                    {...register('ward')}
                    disabled={saving || loadingWards || !selectedDistrict}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000]"
                  >
                    <option value="">Chọn phường/xã</option>
                    {selectedDistrict?.wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.ward.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="address"
                  >
                    Đường/số nhà
                  </label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Đường/số nhà"
                    required
                    disabled={saving}
                  />
                  {errors.address && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="apartment"
                  >
                    Căn hộ/tòa nhà (tùy chọn)
                  </label>
                  <Input
                    id="apartment"
                    {...register('apartment')}
                    placeholder="Căn hộ/tòa nhà"
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register('isDefault')}
                    disabled={saving}
                    className="w-4 h-4 text-[#a10000] border-gray-300 rounded focus:ring-[#a10000]"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm font-medium text-gray-700"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#a10000] hover:bg-red-800"
                  >
                    {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm địa chỉ'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                    }}
                    disabled={saving}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
