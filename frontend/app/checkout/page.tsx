"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/lib/cart-store";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/lib/checkout-store";
import { CartItem } from "@/lib/cart-store";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Image from "next/image";
import { api } from "@/lib/api";

function fetcher(url: string) {
  return fetch(url).then(r => r.json());
}

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Invalid Vietnamese phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  province: z.string(),
  district: z.string(),
  ward: z.string(),
  address: z.string().min(5, "Delivery address is required"),
  addressMode: z.enum(["manual", "map"]),
  apartment: z.string().optional(),
  note: z.string().optional(),
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
  const { data: session } = useSession();
  const user = session?.user;
  const { data: savedAddresses = [] } = useSWR(user ? "/v1/users/addresses" : null, fetcher);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(savedAddresses.length > 0 ? savedAddresses[0].id : "new");
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      addressMode: "manual",
      email: user?.email || "",
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

  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoadingProvinces(false);
      });
  }, []);

  // Pre-fill form when address is selected
  useEffect(() => {
    if (loadingProvinces) return;
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
  }, [selectedAddressId, savedAddresses, loadingProvinces, reset, setValue, user?.email]);

  const shippingFee = subtotal >= 2000000 ? 0 : 30000;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
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
        });
      } catch { /* ignore for now */ }
    }
    setCheckoutInfo({ ...data, email: data.email ?? "" });
    setProducts(items as CartItem[]);
    setDeliveryFee(shippingFee);
    setTimeout(() => {
      setLoading(false);
      router.push("/payment");
    }, 1200);
  };

  // Register addressMode and set value on toggle
  const handleAddressModeChange = (mode: "manual" | "map") => {
    setAddressMode(mode);
    setValue("addressMode", mode);
  };

  // Remove local state for province, district, ward
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

  // Always show the address form. If not logged in, show a sign-in link above the form.
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <main className="flex-1 container mx-auto px-2 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Form left, summary right on desktop */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              toast.error("Please fill all required fields correctly.");
              console.log(errors);
            })} className="space-y-6">
              <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-2">Shipping Information</h2>
                <div className="flex flex-col gap-4">
                  {!user && (
                    <div className="mb-2 text-center text-sm text-gray-600">
                      <a href="/login?callbackUrl=/checkout" className="text-red-600 hover:underline">Sign in for faster checkout</a>
                    </div>
                  )}
                  {user && savedAddresses.length > 0 && (
                    <div>
                      <label className="block font-medium mb-1">Select Address</label>
                      <select
                        className="w-full border rounded px-2 py-2 mb-2"
                        value={selectedAddressId}
                        onChange={e => setSelectedAddressId(e.target.value)}
                      >
                        {[...savedAddresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map((a: Address) => (
                          <option key={a.id} value={a.id}>
                            {getAddressDisplay(a, provinces)}{a.isDefault ? " (Default)" : ""}
                          </option>
                        ))}
                        <option value="new">Add new address</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block font-medium mb-1" htmlFor="fullName">Full Name</label>
                    <Input id="fullName" {...register("fullName")}/>
                    {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="phone">Phone Number</label>
                    <Input id="phone" {...register("phone")}/>
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="email">Email Address (optional)</label>
                    <Input id="email" type="email" {...register("email")}/>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  {/* Address Mode Toggle */}
                  <div>
                    <label className="block font-medium mb-1">Delivery Address</label>
                    <div className="flex gap-2 mb-2">
                      <Button type="button" variant={addressMode === "manual" ? "default" : "outline"} size="sm" onClick={() => handleAddressModeChange("manual")}>Manual Entry</Button>
                      <Button type="button" variant={addressMode === "map" ? "default" : "outline"} size="sm" onClick={() => handleAddressModeChange("map")}>Map Selection</Button>
                      <input type="hidden" {...register("addressMode")}/>
                    </div>
                    {errors.addressMode && <p className="text-red-600 text-sm mt-1">{errors.addressMode.message}</p>}
                    {addressMode === "manual" ? (
                      <div className="space-y-2">
                        {/* Province dropdown */}
                        <div>
                          <label className="block text-sm mb-1">Province/City</label>
                          <select className="w-full border rounded px-2 py-2" {...register("province")} onChange={handleProvinceChange} disabled={loadingProvinces}>
                            <option value="">{loadingProvinces ? "Loading..." : "Select province/city"}</option>
                            {provinces.map((p) => (
                              <option key={p.code} value={String(p.code)}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* District dropdown */}
                        <div>
                          <label className="block text-sm mb-1">District</label>
                          <select className="w-full border rounded px-2 py-2" {...register("district")} onChange={handleDistrictChange} disabled={!watch("province") || loadingDistricts}>
                            <option value="">{loadingDistricts ? "Loading..." : "Select district"}</option>
                            {watch("province") && !loadingDistricts && provinces.find(p => String(p.code) === String(watch("province")))?.districts.map((d: District) => (
                              <option key={d.code} value={String(d.code)}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Ward dropdown */}
                        <div>
                          <label className="block text-sm mb-1">Ward/Commune</label>
                          <select className="w-full border rounded px-2 py-2" {...register("ward")} onChange={e => setValue("ward", e.target.value)} disabled={!watch("district") || loadingWards}>
                            <option value="">{loadingWards ? "Loading..." : "Select ward/commune"}</option>
                            {watch("province") && watch("district") && !loadingWards && provinces.find(p => String(p.code) === String(watch("province")))?.districts.find((d: District) => String(d.code) === String(watch("district")))?.wards.map((w: Ward) => (
                              <option key={w.code} value={String(w.code)}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Street/house autocomplete */}
                        <div>
                          <label className="block text-sm mb-1">Street/House Number</label>
                          <Input
                            id="address"
                            placeholder="Enter street/house number..."
                            autoComplete="off"
                            {...register("address")}
                          />
                          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        {/* Optional apartment/unit */}
                        <div>
                          <label className="block text-sm mb-1">Apartment/Unit (optional)</label>
                          <Input id="apartment" {...register("apartment")}/>
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
                        <span className="text-xs text-gray-400 absolute bottom-2 left-2">(Mock map, click marker to move)</span>
                      </div>
                    )}
                    {/* Resolved address feedback */}
                    {watchedAddress && <div className="text-green-700 text-sm mt-1">Resolved: {watchedAddress}</div>}
                  </div>
                  {/* Optional note */}
                  <div>
                    <label className="block font-medium mb-1" htmlFor="note">Note (optional)</label>
                    <Textarea id="note" rows={2} {...register("note")}/>
                  </div>
                </div>
              </Card>
              <Button type="submit" className="w-full text-base font-semibold py-3" disabled={loading || items.length === 0}>
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
              {items.length === 0 && (
                <div className="text-center text-gray-500 mt-2">
                  Your cart is empty. <Link href="/products" className="underline">Browse products</Link>
                </div>
              )}
            </form>
          </div>
          {/* Order Summary */}
          <div className="md:w-[350px] w-full md:sticky md:top-24 flex-shrink-0">
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
              <ul className="divide-y">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="py-2 flex items-center gap-3">
                    <div className="w-14 h-14 rounded bg-gray-50 border flex items-center justify-center overflow-hidden">
                      <Image
                        src={product.image || (product.images && product.images[0]) || ''}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-500">x{quantity}</div>
                    </div>
                    <div className="font-semibold text-red-700 text-sm">{currencyFormatter.format(product.price * quantity)}</div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-2 text-base">
                <span>Subtotal</span>
                <span>{currencyFormatter.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-green-600 font-semibold">Free</span> : currencyFormatter.format(shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
                <span>Total</span>
                <span className="text-red-700">{currencyFormatter.format(subtotal + shippingFee)}</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 