"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingOrEmpty } from "@/components/ui/LoadingOrEmpty";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Star, StarOff, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Họ tên là bắt buộc"),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại Việt Nam không hợp lệ"),
  province: z.string().min(1, "Tỉnh/thành phố là bắt buộc"),
  district: z.string().min(1, "Quận/huyện là bắt buộc"),
  ward: z.string().min(1, "Phường/xã là bắt buộc"),
  address: z.string().min(5, "Đường/số nhà là bắt buộc"),
  apartment: z.string().optional(),
  country: z.string().min(2, "Quốc gia là bắt buộc"),
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

function fetcher(url: string) {
  return api.get(url.replace('/v1', ''));
}

function getLine1(addr: Address): string {
  return [addr.address, addr.apartment].filter(Boolean).join(", ");
}
function getLine2(addr: Address, provinces: Province[]): string {
  const province = provinces.find((p) => String(p.code) === String(addr.province))?.name || "";
  const district = provinces.find((p) => String(p.code) === String(addr.province))?.districts.find((d) => String(d.code) === String(addr.district))?.name || "";
  const ward = provinces.find((p) => String(p.code) === String(addr.province))?.districts.find((d) => String(d.code) === String(addr.district))?.wards.find((w) => String(w.code) === String(addr.ward))?.name || "";
  return [ward, district, province].filter(Boolean).join(", ");
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const { data: addressesResponse, mutate, isLoading } = useSWR(
    session?.user ? ["/v1/users/addresses", session] : null,
    ([url, session]) => api.get(url.replace('/v1', ''), session),
    {
      fallbackData: { addresses: [] },
      revalidateOnFocus: false
    }
  );
  
  // Extract addresses from response with fallback
  const addresses = addressesResponse?.addresses || addressesResponse?.data?.addresses || [];
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const editing = editId && addresses ? addresses.find((a: Address) => a.id === editId) : null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: editing || { country: "Vietnam", isDefault: false },
  });

  // Province/district/ward logic
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoadingProvinces(false);
      });
  }, []);

  const provinceCode = watch("province");
  const districtCode = watch("district");
  const selectedProvince = provinces.find(p => String(p.code) === String(provinceCode));
  const selectedDistrict = selectedProvince?.districts.find(d => String(d.code) === String(districtCode));

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
        setValue("province", String(editing.province));
        setValue("district", String(editing.district));
        setValue("ward", String(editing.ward));
      }, 0);
    } else {
      reset({ country: "Vietnam", isDefault: false });
    }
  }, [editing, reset, setValue]);

  // Create or update address
  const addAddress = async (data: AddressForm) => {
    setSaving(true);
    try {
      await api.post("/users/addresses", data, session);
      mutate();
      toast.success("Địa chỉ đã được thêm!");
      reset();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await api.delete(`/users/addresses/${id}`, session);
      mutate();
      toast.success("Địa chỉ đã được xóa!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await api.put(`/users/addresses/${id}/default`, {}, session);
      mutate();
      toast.success("Địa chỉ mặc định đã được cập nhật!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định");
      }
    }
  };

  // Province/district/ward change handlers
  const handleProvinceChange = (val: string) => {
    setValue("province", val);
    setValue("district", "");
    setValue("ward", "");
    setLoadingDistricts(true);
    setTimeout(() => setLoadingDistricts(false), 500);
  };
  const handleDistrictChange = (val: string) => {
    setValue("district", val);
    setValue("ward", "");
    setLoadingWards(true);
    setTimeout(() => setLoadingWards(false), 500);
  };

  return (
    <div className="py-8 max-w-2xl mx-auto px-2 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Địa chỉ của bạn</h2>
        <Button variant="outline" size="sm" onClick={() => { setEditId(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ
        </Button>
      </div>
      <LoadingOrEmpty loading={isLoading} empty={!addresses || addresses.length === 0} emptyText="Chưa có địa chỉ nào được lưu.">
        <div className="flex flex-col gap-4">
          {addresses?.map((addr: Address) => (
            <Card key={addr.id} className={`relative p-4 flex flex-col md:flex-row md:items-center gap-2 border ${addr.isDefault ? 'border-primary' : 'border-gray-200'}`}>
              <div className="flex-1">
                <div className="font-semibold text-base flex items-center gap-2">
                  {addr.fullName}
                  {addr.isDefault && <span className="inline-flex items-center px-2 py-0.5 text-xs bg-primary/10 text-primary rounded ml-2"><Star className="w-4 h-4 mr-1" /> Mặc định</span>}
                </div>
                <div className="text-gray-500 text-sm">{addr.phone}</div>
                <div className="text-gray-700 text-sm mt-1">
                  <div>{getLine1(addr)}</div>
                  <div>{getLine2(addr, provinces)}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                {!addr.isDefault && (
                  <Button variant="ghost" size="icon" title="Đặt làm mặc định" onClick={() => setDefaultAddress(addr.id)}>
                    <StarOff className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" title="Chỉnh sửa" onClick={() => { setEditId(addr.id); setShowForm(true); }}>
                  <Edit2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Xóa" className="text-red-500 hover:bg-red-50" onClick={() => deleteAddress(addr.id)} disabled={deleting === addr.id}>
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
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowForm(false); setEditId(null); }}>
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-semibold mb-4">{editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}</h3>
            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit(addAddress)}>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="fullName">Họ tên</label>
                <Input id="fullName" {...register("fullName")}
                  placeholder="Họ tên" required disabled={saving} />
                {errors.fullName && <div className="text-red-500 text-xs mt-1">{errors.fullName.message}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Số điện thoại</label>
                <Input id="phone" {...register("phone")}
                  placeholder="Số điện thoại" required disabled={saving} />
                {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone.message}</div>}
              </div>
              {/* Province dropdown */}
              <div>
                <label className="block text-sm mb-1">Tỉnh/Thành phố</label>
                <select className="w-full border rounded px-2 py-2" {...register("province")} onChange={e => handleProvinceChange(e.target.value)} disabled={loadingProvinces || saving}>
                  <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                  {provinces?.map((p) => (
                    <option key={p.code} value={String(p.code)}>{p.name}</option>
                  ))}
                </select>
                {errors.province && <div className="text-red-500 text-xs mt-1">{errors.province.message}</div>}
              </div>
              {/* District dropdown */}
              <div>
                <label className="block text-sm mb-1">Quận/Huyện</label>
                <select className="w-full border rounded px-2 py-2" {...register("district")} onChange={e => handleDistrictChange(e.target.value)} disabled={!provinceCode || loadingDistricts || saving}>
                  <option value="">{loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}</option>
                  {provinceCode && !loadingDistricts && selectedProvince?.districts?.map((d: District) => (
                    <option key={d.code} value={String(d.code)}>{d.name}</option>
                  ))}
                </select>
                {errors.district && <div className="text-red-500 text-xs mt-1">{errors.district.message}</div>}
              </div>
              {/* Ward dropdown */}
              <div>
                <label className="block text-sm mb-1">Phường/Xã</label>
                <select className="w-full border rounded px-2 py-2" {...register("ward")} disabled={!districtCode || loadingWards || saving}>
                  <option value="">{loadingWards ? "Đang tải..." : "Chọn phường/xã"}</option>
                  {provinceCode && districtCode && !loadingWards && selectedDistrict?.wards?.map((w: Ward) => (
                    <option key={w.code} value={String(w.code)}>{w.name}</option>
                  ))}
                </select>
                {errors.ward && <div className="text-red-500 text-xs mt-1">{errors.ward.message}</div>}
              </div>
              {/* Street/house */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="address">Đường/Số nhà</label>
                <Input id="address" {...register("address")}
                  placeholder="Nhập đường/số nhà..." required disabled={saving} />
                {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address.message}</div>}
              </div>
              {/* Apartment/unit */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="apartment">Căn hộ/Đơn vị (tùy chọn)</label>
                <Input id="apartment" {...register("apartment")}
                  placeholder="Căn hộ, suite, v.v." disabled={saving} />
                {errors.apartment && <div className="text-red-500 text-xs mt-1">{errors.apartment.message}</div>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isDefault" {...register("isDefault")} disabled={saving} className="w-4 h-4" />
                <label htmlFor="isDefault" className="text-sm">Đặt làm địa chỉ mặc định</label>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={saving}>{editing ? "Lưu thay đổi" : "Thêm địa chỉ"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 