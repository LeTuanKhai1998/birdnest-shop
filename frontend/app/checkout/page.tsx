"use client";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { api } from "@/lib/api";
import { SafeImage } from "@/components/SafeImage";
import { useHydrationSafe } from "@/hooks/useHydrationSafe";
import useSWR from "swr";
import type { CartItem } from "@/lib/cart-store";

// Reusable FormError component
const FormError = ({ error }: { error?: { message?: string } }) => {
  if (!error) return null;
  
  return (
    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-600 text-sm flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error.message}
      </p>
    </div>
  );
};

function fetcher(url: string, session: any) {
  return api.get(url.replace('/v1', ''), session);
}

const schema = z.object({
  fullName: z.string()
    .min(1, "Họ tên là bắt buộc")
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự"),
  phone: z.string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không được quá 11 số"),
  email: z.string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .min(1, "Địa chỉ là bắt buộc")
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(200, "Địa chỉ không được quá 200 ký tự"),
  note: z.string()
    .max(500, "Ghi chú không được quá 500 ký tự")
    .optional(),
  // Keep existing address fields for compatibility
  province: z.string()
    .min(1, "Tỉnh/Thành phố là bắt buộc"),
  district: z.string()
    .min(1, "Quận/Huyện là bắt buộc"),
  ward: z.string()
    .min(1, "Phường/Xã là bắt buộc"),
  addressMode: z.enum(["manual", "map"]),
  apartment: z.string()
    .max(50, "Số căn hộ không được quá 50 ký tự")
    .optional(),
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
  const province = provinces.find((p: Province) => String(p.code) === String(addr.province))?.name || "";
  const district = provinces.find((p: Province) => String(p.code) === String(addr.province))?.districts.find((d: District) => String(d.code) === String(addr.district))?.name || "";
  const ward = provinces.find((p: Province) => String(p.code) === String(addr.province))?.districts.find((d: District) => String(d.code) === String(addr.district))?.wards.find((w: Ward) => String(w.code) === String(addr.ward))?.name || "";
  return [addr.address, addr.apartment, ward, district, province].filter(Boolean).join(", ");
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const { isHydrated } = useHydrationSafe();
  
  // Only fetch addresses after component is mounted and user is authenticated
  const { data: savedAddresses = [] } = useSWR(
    isHydrated && user ? ["/v1/users/addresses", session] : null, 
    ([url, session]) => fetcher(url, session)
  );
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, touchedFields }, watch, setValue, reset, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      addressMode: "manual",
      email: "",
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      address: "",
      apartment: "",
      note: "",
    },
  });
  const [addressMode, setAddressMode] = useState<"manual" | "map">("manual");
  const [mockMarker, setMockMarker] = useState({ lat: 10.776, lng: 106.7 });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const setCheckoutInfo = useCheckoutStore((s) => s.setCheckoutInfo);
  const setProducts = useCheckoutStore((s) => s.setProducts);
  const setDeliveryFee = useCheckoutStore((s) => s.setDeliveryFee);
  const lastResetId = useRef<string | null>(null);

  // Set default selected address after addresses are loaded
  useEffect(() => {
    if (isHydrated && savedAddresses.length > 0 && selectedAddressId === "new") {
      setSelectedAddressId(savedAddresses[0].id);
    }
  }, [isHydrated, savedAddresses, selectedAddressId]);

  // Set email when user is available
  useEffect(() => {
    if (isHydrated && user?.email) {
      setValue("email", user.email);
    }
  }, [isHydrated, user?.email, setValue]);

  useEffect(() => {
    if (!isHydrated) return;
    
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoadingProvinces(false);
      })
      .catch(() => {
        setLoadingProvinces(false);
      });
  }, [isHydrated]);

  // Pre-fill form when address is selected
  useEffect(() => {
    if (!isHydrated || loadingProvinces) return;
    if (selectedAddressId && selectedAddressId !== "new") {
      if (lastResetId.current !== selectedAddressId) {
        const addr = savedAddresses.find((a: Address) => a.id === selectedAddressId);
        if (addr) {
          reset({
            fullName: addr.fullName,
            phone: addr.phone,
            email: addr.email && addr.email !== "" ? addr.email : (user?.email ?? ""),
            province: String(addr.province),
            district: String(addr.district),
            ward: String(addr.ward),
            address: addr.address,
            apartment: addr.apartment || "",
            addressMode: "manual",
            note: "",
          });
          setTimeout(() => {
            setValue("province", String(addr.province));
            setValue("district", String(addr.district));
            setValue("ward", String(addr.ward));
          }, 0);
          lastResetId.current = selectedAddressId;
        }
      }
    } else if (lastResetId.current !== "new") {
      reset({
        fullName: "",
        phone: "",
        email: user?.email ?? "",
        province: "",
        district: "",
        ward: "",
        address: "",
        apartment: "",
        addressMode: "manual",
        note: "",
      });
      lastResetId.current = "new";
    }
  }, [selectedAddressId, savedAddresses, loadingProvinces, reset, setValue, user?.email, isHydrated]);

  const shippingFee = subtotal >= 2000000 ? 0 : 30000;

  const onSubmit = async (data: FormData) => {
    // Pre-submission validation
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin trước khi tiếp tục");
      return;
    }

    setLoading(true);
    
    try {
      // If user is logged in and selected 'new', auto-save address
      if (user && (selectedAddressId === "new" || !selectedAddressId)) {
        try {
          await api.post("/users/addresses", {
            fullName: data.fullName,
            phone: data.phone,
            province: String(data.province),
            district: String(data.district),
            ward: String(data.ward),
            address: data.address,
            apartment: data.apartment,
            country: "Vietnam",
            isDefault: savedAddresses.length === 0,
          }, session);
        } catch (error) {
          console.error("Failed to save address:", error);
          // Continue with checkout even if address save fails
        }
      }
      
      setCheckoutInfo({ ...data, email: data.email ?? "" });
      setProducts(items as CartItem[]);
      setDeliveryFee(shippingFee);
      
      // Show success message
      toast.success("Thông tin đã được xác nhận. Đang chuyển đến trang thanh toán...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        router.push("/payment");
      }, 1200);
      
    } catch (error) {
      setLoading(false);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Checkout error:", error);
    }
  };

  const onError = (errors: FieldErrors<FormData>) => {
    console.log("Form validation errors:", errors);
    
    // Get all error messages
    const errorMessages: string[] = [];
    
    Object.entries(errors).forEach(([fieldName, error]) => {
      if (error?.message) {
        const fieldLabels: { [key: string]: string } = {
          fullName: "Họ tên",
          phone: "Số điện thoại",
          email: "Email",
          address: "Địa chỉ",
          province: "Tỉnh/Thành phố",
          district: "Quận/Huyện",
          ward: "Phường/Xã",
          addressMode: "Phương thức nhập địa chỉ"
        };
        
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        errorMessages.push(`${fieldLabel}: ${error.message}`);
      }
    });
    
    // Show appropriate toast based on number of errors
    if (errorMessages.length === 1) {
      toast.error(errorMessages[0]);
    } else if (errorMessages.length <= 3) {
      toast.error(`Vui lòng sửa các lỗi sau: ${errorMessages.join(', ')}`);
    } else {
      toast.error(`Vui lòng sửa ${errorMessages.length} lỗi trong biểu mẫu`);
    }
  };

  // Register addressMode and set value on toggle
  const handleAddressModeChange = (mode: "manual" | "map") => {
    setAddressMode(mode);
    setValue("addressMode", mode);
  };

  // When province changes, reset district/ward
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("province", val);
    setValue("district", "");
    setValue("ward", "");
    setLoadingDistricts(true);
    setTimeout(() => setLoadingDistricts(false), 500); // mock loading
  };
  
  // When district changes, reset ward
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("district", val);
    setValue("ward", "");
    setLoadingWards(true);
    setTimeout(() => setLoadingWards(false), 500); // mock loading
  };

  const watchedAddress = watch("address");

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 container mx-auto px-2 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Redirect unauthenticated users to sign-in page
  if (status === "unauthenticated") {
    router.push("/sign-in?redirect=/checkout");
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 container mx-auto px-2 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang chuyển hướng đến trang đăng nhập...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 container mx-auto px-2 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Always show the address form. If not logged in, show a sign-in link above the form.
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <main className="flex-1 container mx-auto px-2 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Thanh Toán</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form left, summary right on desktop */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
              <Card className="p-4 sm:p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Thông Tin Giao Hàng</h2>
                <div className="flex flex-col gap-4 sm:gap-6">
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block font-medium mb-1">Chọn Địa Chỉ</label>
                      <select
                        className="w-full border rounded px-2 py-2 mb-2"
                        value={selectedAddressId}
                        onChange={e => setSelectedAddressId(e.target.value)}
                      >
                        {[...savedAddresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map((a: Address) => (
                          <option key={a.id} value={a.id}>
                            {getAddressDisplay(a, provinces)}{a.isDefault ? " (Mặc Định)" : ""}
                          </option>
                        ))}
                        <option value="new">Thêm địa chỉ mới</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block font-medium mb-1" htmlFor="fullName">
                      Họ Tên <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="fullName" 
                      {...register("fullName")}
                      placeholder="Nhập họ tên của bạn"
                      className={
                        errors.fullName 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : touchedFields.fullName && !errors.fullName
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
                      }
                    />
                    <FormError error={errors.fullName} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="phone">
                      Số Điện Thoại <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="phone" 
                      {...register("phone")}
                      placeholder="Nhập số điện thoại của bạn"
                      className={
                        errors.phone 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : touchedFields.phone && !errors.phone
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
                      }
                    />
                    <FormError error={errors.phone} />
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="email">
                      Email <span className="text-gray-400 text-sm">(tùy chọn)</span>
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register("email")}
                      placeholder="Nhập địa chỉ email của bạn"
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                    <FormError error={errors.email} />
                  </div>
                  {/* Address Mode Toggle */}
                  <div>
                    <label className="block font-medium mb-1">
                      Địa Chỉ Giao Hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Button type="button" variant={addressMode === "manual" ? "default" : "outline"} size="sm" onClick={() => handleAddressModeChange("manual")}>Nhập Thủ Công</Button>
                      <Button type="button" variant={addressMode === "map" ? "default" : "outline"} size="sm" onClick={() => handleAddressModeChange("map")}>Chọn Trên Bản Đồ</Button>
                      <input type="hidden" {...register("addressMode")}/>
                    </div>
                    <FormError error={errors.addressMode} />
                    {addressMode === "manual" ? (
                      <div className="space-y-2">
                        {/* Province dropdown */}
                        <div>
                          <label className="block text-sm mb-1">
                            Tỉnh/Thành Phố <span className="text-red-500">*</span>
                          </label>
                          <select 
                            className={`w-full border rounded px-2 py-2 ${errors.province ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-red-500`}
                            {...register("province")} 
                            onChange={handleProvinceChange} 
                            disabled={loadingProvinces}
                          >
                            <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                            {provinces.map((p) => (
                              <option key={p.code} value={String(p.code)}>{p.name}</option>
                            ))}
                          </select>
                          <FormError error={errors.province} />
                        </div>
                        {/* District dropdown */}
                        <div>
                          <label className="block text-sm mb-1">
                            Quận/Huyện <span className="text-red-500">*</span>
                          </label>
                          <select 
                            className={`w-full border rounded px-2 py-2 ${errors.district ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-red-500`}
                            {...register("district")} 
                            onChange={handleDistrictChange} 
                            disabled={!watch("province") || loadingDistricts}
                          >
                            <option value="">{loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}</option>
                            {watch("province") && !loadingDistricts && provinces.find(p => String(p.code) === String(watch("province")))?.districts.map((d: District) => (
                              <option key={d.code} value={String(d.code)}>{d.name}</option>
                            ))}
                          </select>
                          <FormError error={errors.district} />
                        </div>
                        {/* Ward dropdown */}
                        <div>
                          <label className="block text-sm mb-1">
                            Phường/Xã <span className="text-red-500">*</span>
                          </label>
                          <select 
                            className={`w-full border rounded px-2 py-2 ${errors.ward ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-red-500`}
                            {...register("ward")} 
                            onChange={e => setValue("ward", e.target.value)} 
                            disabled={!watch("district") || loadingWards}
                          >
                            <option value="">{loadingWards ? "Đang tải..." : "Chọn phường/xã"}</option>
                            {watch("province") && watch("district") && !loadingWards && provinces.find(p => String(p.code) === String(watch("province")))?.districts.find((d: District) => String(d.code) === String(watch("district")))?.wards.map((w: Ward) => (
                              <option key={w.code} value={String(w.code)}>{w.name}</option>
                            ))}
                          </select>
                          <FormError error={errors.ward} />
                        </div>
                        {/* Street/house autocomplete */}
                        <div>
                          <label className="block text-sm mb-1">
                            Số Nhà/Đường <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="address"
                            placeholder="Nhập số nhà và tên đường..."
                            autoComplete="off"
                            {...register("address")}
                            className={
                              errors.address 
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                : touchedFields.address && !errors.address
                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                                : 'border-gray-300 focus:border-red-500 focus:ring-red-500'
                            }
                          />
                          <FormError error={errors.address} />
                        </div>
                        {/* Optional apartment/unit */}
                        <div>
                          <label className="block text-sm mb-1">
                            Căn Hộ/Đơn Vị <span className="text-gray-400 text-xs">(tùy chọn)</span>
                          </label>
                          <Input 
                            id="apartment" 
                            {...register("apartment")}
                            placeholder="Nhập số căn hộ/đơn vị"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center relative mb-2">
                        {/* Mock map with marker */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setMockMarker({ lat: mockMarker.lat + 0.001, lng: mockMarker.lng + 0.001 })}>
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-7-7-7-11a7 7 0 1 1 14 0c0 4-3 7-7 11z" />
                            <circle cx="12" cy="10" r="3" fill="currentColor" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 absolute bottom-2 left-2">(Bản đồ mẫu, nhấp vào marker để di chuyển)</span>
                      </div>
                    )}
                    {/* Resolved address feedback */}
                    {watchedAddress && <div className="text-green-700 text-sm mt-1">Đã xác định: {watchedAddress}</div>}
                  </div>
                  {/* Optional note */}
                  <div>
                    <label className="block font-medium mb-1" htmlFor="note">
                      Ghi Chú <span className="text-gray-400 text-sm">(tùy chọn)</span>
                    </label>
                    <Textarea 
                      id="note" 
                      rows={2} 
                      {...register("note")}
                      placeholder="Thêm hướng dẫn đặc biệt..."
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </Card>
              <Button 
                type="submit" 
                className="w-full text-base font-semibold py-3 h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Tiến Hành Thanh Toán"
                )}
              </Button>
              {items.length === 0 && (
                <div className="text-center text-gray-500 mt-2">
                  Giỏ hàng của bạn trống. <Link href="/products" className="underline">Xem sản phẩm</Link>
                </div>
              )}
            </form>
          </div>
          {/* Order Summary */}
          <div className="md:w-[320px] w-full md:sticky md:top-24 flex-shrink-0">
            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-semibold mb-3">Tóm Tắt Đơn Hàng</h2>
              {items.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="py-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        <SafeImage
                          src={product.image || (product.images && product.images[0]) || ''}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight line-clamp-2">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-1">SL: {quantity}</div>
                      </div>
                      <div className="font-semibold text-red-700 text-sm flex-shrink-0">{currencyFormatter.format(product.price * quantity)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm">Giỏ hàng của bạn trống</p>
                  <Link href="/products" className="text-red-600 hover:underline text-sm mt-1 inline-block">
                    Xem sản phẩm
                  </Link>
                </div>
              )}
              {items.length > 0 && (
                <>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Tạm tính</span>
                      <span>{currencyFormatter.format(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Phí vận chuyển</span>
                      <span>{shippingFee === 0 ? <span className="text-green-600 font-semibold">Miễn phí</span> : currencyFormatter.format(shippingFee)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-red-700">{currencyFormatter.format(subtotal + shippingFee)}</span>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 