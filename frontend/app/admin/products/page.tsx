"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useRef } from "react";
import { AdminTable } from "@/components/ui/AdminTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { productsApi, Product as ApiProduct } from "@/lib/api-service";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Description is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, {
      message: "Price must be a number and at least 1,000 VND",
    }),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  category: z.string().min(2, "Category is required"),
  status: z.enum(["active", "inactive"]),
  // images: z.array(z.string()).optional(), // Placeholder for now
});

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;
type FilterForm = z.infer<typeof filterSchema>;

const CATEGORIES = ["Refined Nest", "Raw Nest", "Feather-removed Nest", "Combo"];
const STATUS = ["active", "inactive"];

// Add a fallback image path
const FALLBACK_IMAGE = "/images/banner1.png";

// Add a helper to mark one image as primary
function setPrimaryImage(images: { url: string; isPrimary?: boolean }[], url: string) {
  return images.map(img => ({ ...img, isPrimary: img.url === url }));
}

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary?: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real data state
  const [productList, setProductList] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter form
  const {
    register: filterRegister,
    watch: filterWatch,
    setValue: setFilterValue,
    reset: resetFilter,
  } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "", category: "", status: "" },
  });

  // Product form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: "1000", stock: "0", category: "", status: "active" },
    mode: "onTouched",
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      const response = await productsApi.getProducts();
      const products = response.data?.products || response.products || [];
      setProductList(products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilterValue("search", searchValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, setFilterValue]);

  // Watch filter values
  const filterCategory = filterWatch("category");
  const filterStatus = filterWatch("status");
  const filterSearch = filterWatch("search");

  // Filter products in-memory
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchesSearch =
        !filterSearch ||
        p.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(filterSearch.toLowerCase());
      const matchesCategory = !filterCategory || p.category?.name === filterCategory;
      const matchesStatus = !filterStatus || (p.quantity > 0 ? 'active' : 'inactive') === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productList, filterSearch, filterCategory, filterStatus]);

  // On submit, send images array (with url and isPrimary) to API
  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      // Prepare payload with form data and images
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        quantity: Number(data.stock),
        categoryId: data.category, // This should be category ID, not name
        images: images.map(img => ({ 
          url: img.url, 
          isPrimary: img.isPrimary || false 
        }))
      };
      
      if (editId) {
        // Edit mode
        await productsApi.updateProduct(editId, payload, "admin-token"); // TODO: Get real token
        console.log('Product updated:', editId);
      } else {
        // Create mode
        await productsApi.createProduct(payload, "admin-token"); // TODO: Get real token
        console.log('Product created');
      }
      
      // Refresh products list
      await fetchProducts();
      
      reset();
      setEditId(null);
      setImages([]);
      setDrawerOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button
  const handleEdit = (product: ApiProduct) => {
    setEditId(product.id);
    const sanitizedPrice = String(product.price ?? "").replace(/[^\d]/g, "");
    setValue("name", product.name);
    setValue("description", product.description || '');
    setValue("price", sanitizedPrice);
    setValue("stock", String(product.quantity ?? ""));
    setValue("category", product.category?.name || '');
    setValue("status", (product.quantity || 0) > 0 ? 'active' : 'inactive');
    // Load images from product.images (API shape)
    setImages((product.images || []).map((img, i) => ({ 
      url: img.url, 
      isPrimary: img.isPrimary ?? i === 0 
    })));
    setDrawerOpen(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditId(null);
    reset();
  };

  // Handle image upload (simulate, replace with Uploadthing integration)
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    setUploading(true);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const newImages: { url: string; isPrimary?: boolean }[] = [];
    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Only JPG, PNG, and WEBP images are allowed.");
        setUploading(false);
        return;
      }
      if (file.size > maxSize) {
        setUploadError("Each image must be less than 2MB.");
        setUploading(false);
        return;
      }
      // Simulate upload and get URL (replace with Uploadthing integration)
      const url = URL.createObjectURL(file);
      newImages.push({ url });
    }
    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove image
  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img.url !== url));
  };

  // Set primary image
  const handleSetPrimary = (url: string) => {
    setImages((prev) => setPrimaryImage(prev, url));
  };

  // Add state for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Handle delete button click
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productsApi.deleteProduct(productToDelete, "admin-token"); // TODO: Get real token
      await fetchProducts(); // Refresh the list
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product');
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Move this to the top level of the component, not inside a callback
  const [showMore, setShowMore] = useState(false);

  // Show loading state
  if (loadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button onClick={fetchProducts}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Product Management</h2>
      {/* Filter Bar */}
      <form className="mb-6 flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow-sm" onSubmit={e => e.preventDefault()} aria-label="Product Filters">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="block text-xs font-medium mb-1">Search (Name, Slug, ID)</label>
          <Input
            id="search"
            placeholder="Search products..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            autoComplete="off"
            className=""
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-xs font-medium mb-1">Category</label>
          <select
            id="category"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...filterRegister("category")}
          >
            <option value="">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-medium mb-1">Status</label>
          <select
            id="status"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            {...filterRegister("status")}
          >
            <option value="">All</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <Button type="button" variant="outline" onClick={() => { resetFilter(); setSearchValue(""); }}>Reset</Button>
        </div>
      </form>
      {/* Add Product Button and Drawer */}
      <div className="hidden md:flex justify-end mb-4">
        <Button onClick={() => {
          setEditId(null);
          setImages([]);
          reset({
            name: "",
            description: "",
            price: "1000",
            stock: "0",
            category: "",
            status: "active"
          });
          setDrawerOpen(true);
        }}>
          Add Product
        </Button>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-w-lg w-full mx-auto">
            <DrawerHeader>
              <DrawerTitle>{editId ? "Edit Product" : "Add Product"}</DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[70vh] px-4" aria-label={editId ? "Edit Product Form" : "Add Product Form"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <Input id="name" {...register("name")} aria-invalid={!!errors.name} aria-describedby="name-error" />
                  {errors.name && (
                    <span id="name-error" className="text-xs text-red-600">{errors.name.message}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">Price (VND)</label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }: { field: any }) => {
                      const displayValue = field.value
                        ? Number(field.value.replace(/[^\d]/g, "")).toLocaleString()
                        : "";
                      return (
                        <Input
                          id="price"
                          type="text"
                          inputMode="numeric"
                          min={1000}
                          step={1000}
                          value={displayValue}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            field.onChange(raw);
                          }}
                          aria-invalid={!!errors.price}
                          aria-describedby="price-error"
                        />
                      );
                    }}
                  />
                  {errors.price && (
                    <span id="price-error" className="text-xs text-red-600">{errors.price.message}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium mb-1">Stock</label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    step={1}
                    {...register("stock")}
                    aria-invalid={!!errors.stock}
                    aria-describedby="stock-error"
                  />
                  {errors.stock && (
                    <span id="stock-error" className="text-xs text-red-600">{errors.stock.message}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                  <select
                    id="category"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    {...register("category")}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <span id="category-error" className="text-xs text-red-600">{errors.category.message}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }: { field: any }) => (
                      <select
                        id="status"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                      >
                        {STATUS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.status && (
                    <span id="status-error" className="text-xs text-red-600">{errors.status.message}</span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    aria-invalid={!!errors.description}
                    aria-describedby="description-error"
                    rows={4}
                    placeholder="Enter a detailed product description..."
                  />
                  {errors.description && (
                    <span id="description-error" className="text-xs text-red-600">{errors.description.message}</span>
                  )}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Images</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <Button type="button" variant="outline" onClick={handleUploadClick} disabled={uploading} className="mb-2">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    ref={fileInputRef}
                    onChange={e => handleImageUpload(e.target.files)}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploadError && <div className="text-xs text-red-600 mb-2">{uploadError}</div>}
                  <div className="flex gap-2 flex-wrap items-center">
                    {images.map((img, idx) => (
                      <div key={img.url + '-' + idx} className="relative group w-20 h-20 border rounded overflow-hidden">
                        <Image
                          src={img.url}
                          alt={`Product image ${idx + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition"
                          onClick={() => handleRemoveImage(img.url)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          className={`absolute bottom-0 left-0 right-0 bg-white/80 text-xs px-1 py-0.5 rounded-t text-center ${img.isPrimary ? 'text-red-600 font-bold' : 'text-gray-500'}`}
                          onClick={() => handleSetPrimary(img.url)}
                          aria-label="Set as primary"
                          tabIndex={0}
                        >
                          {img.isPrimary ? 'Primary' : 'Set as Primary'}
                        </button>
                      </div>
                    ))}
                    {uploading && <div className="w-20 h-20 flex items-center justify-center border rounded animate-pulse bg-gray-100">Uploading...</div>}
                    {images.length > 0 && (
                      <span
                        className="ml-2 text-xs text-gray-500 truncate max-w-[120px]"
                        title={images.map(i => i.url).join(", ")}
                      >
                        {images.length} image{images.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end py-6">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" onClick={() => { handleCancelEdit(); setDrawerOpen(false); }}>Cancel</Button>
                </DrawerClose>
                <Button type="submit" disabled={loading} aria-busy={loading} className="min-w-[120px]">
                  {loading ? (editId ? "Saving..." : "Creating...") : (editId ? "Save Changes" : "Create Product")}
                </Button>
              </div>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block w-full min-w-0 overflow-x-auto">
        <AdminTable
          columns={[ 
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "thumbnail", label: "Thumbnail" },
            { key: "slug", label: "Slug" },
            { key: "price", label: "Price" },
            { key: "stock", label: "Stock" },
            { key: "category", label: "Category" },
            { key: "status", label: "Status" },
          ]}
          data={filteredProducts.map(p => ({
            id: p.id,
            name: p.name,
            thumbnail: (
              <Image
                src={(p.images && p.images[0]?.url) || FALLBACK_IMAGE}
                alt={p.name}
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded border"
              />
            ),
            slug: p.slug,
            price: p.price.toLocaleString() + " ₫",
            stock: p.quantity,
            category: p.category?.name || "N/A",
            status: <StatusBadge status={(p.quantity || 0) > 0 ? 'active' : 'inactive'} />,
          }))}
          actions={(p: any) => (
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="outline" className="rounded-full px-4 py-1 text-sm font-semibold" onClick={() => { 
                const product = filteredProducts.find(prod => prod.id === p.id);
                if (product) {
                  handleEdit(product);
                  setDrawerOpen(true);
                }
              }}>
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full px-4 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                onClick={() => handleDeleteClick(p.id)}
                aria-label="Delete product"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
          exportButtons={[
            <Button key="csv" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded" onClick={() => alert('Export CSV')}>Export CSV</Button>,
            <Button key="pdf" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded" onClick={() => alert('Export PDF')}>Export PDF</Button>,
          ]}
        />
      </div>
      {/* Mobile Card List */}
      <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24">
        {filteredProducts.map((p) => {
          const desc = p.description || "";
          const isLong = desc.length > 80;
          return (
            <Card key={p.id} className="flex flex-col gap-2 p-4 rounded-lg shadow border border-gray-200 transition hover:bg-gray-50 active:scale-[0.98]">
              <div className="flex items-start gap-4">
                <Image
                  src={(p.images && p.images[0]?.url) || FALLBACK_IMAGE}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded border"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-lg text-gray-900 truncate">{p.name}</div>
                    <Badge variant={(p.quantity || 0) > 0 ? 'success' : 'secondary'} className={(p.quantity || 0) > 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                      {(p.quantity || 0) > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-700 text-base">₫{p.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">Stock: {p.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Slug: {p.slug}</span>
                    <span className="text-xs text-gray-500">Category: {p.category?.name || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-700 whitespace-pre-line">
                    <span>
                      {isLong && !showMore ? desc.slice(0, 80) + "..." : desc}
                    </span>
                    {isLong && (
                      <button className="ml-2 text-primary underline text-xs" onClick={e => { e.preventDefault(); setShowMore(!showMore); }}>
                        {showMore ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => handleEdit(p)} aria-label={`Edit product ${p.name}`}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDeleteClick(p.id)}
                  aria-label={`Delete product ${p.name}`}
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
        {/* Floating Add Product Button */}
        <Button className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-lg bg-primary text-white text-2xl flex items-center justify-center" onClick={() => {
          setEditId(null);
          setImages([]);
          reset({
            name: "",
            description: "",
            price: "1000",
            stock: "0",
            category: "",
            status: "active"
          });
          setDrawerOpen(true);
        }} aria-label="Add Product">
          +
        </Button>
      </div>
      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-red-700">Delete Product</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 