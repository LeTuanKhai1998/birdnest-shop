"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Eye, Search, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const products = [
  {
    name: "Premium Refined Birdnest 50g",
    image: "/images/p1.png",
    price: 2500000,
    description: "High quality, ready-to-cook refined birdnest from Kien Giang.",
    type: "Refined Nest",
    origin: "Kien Giang",
    weight: 50,
  },
  {
    name: "Raw Birdnest 100g",
    image: "/images/p2.png",
    price: 4200000,
    description: "Raw, natural birdnest, carefully selected and packed.",
    type: "Raw Nest",
    origin: "Kien Giang",
    weight: 100,
  },
  {
    name: "Feather-removed Birdnest 200g",
    image: "/images/p3.png",
    price: 7900000,
    description: "Feather-removed, premium birdnest for health and gifting.",
    type: "Feather-removed Nest",
    origin: "Kien Giang",
    weight: 200,
  },
  // Add more products or repeat for demo
  {
    name: "Premium Refined Birdnest 100g",
    image: "/images/p1.png",
    price: 4800000,
    description: "Premium refined birdnest, 100g pack.",
    type: "Refined Nest",
    origin: "Kien Giang",
    weight: 100,
  },
  {
    name: "Raw Birdnest 50g",
    image: "/images/p2.png",
    price: 2100000,
    description: "Raw birdnest, 50g pack.",
    type: "Raw Nest",
    origin: "Kien Giang",
    weight: 50,
  },
  {
    name: "Feather-removed Birdnest 100g",
    image: "/images/p3.png",
    price: 3900000,
    description: "Feather-removed birdnest, 100g pack.",
    type: "Feather-removed Nest",
    origin: "Kien Giang",
    weight: 100,
  },
  {
    name: "Premium Refined Birdnest 200g",
    image: "/images/p1.png",
    price: 9500000,
    description: "Premium refined birdnest, 200g pack.",
    type: "Refined Nest",
    origin: "Kien Giang",
    weight: 200,
  },
  {
    name: "Raw Birdnest 200g",
    image: "/images/p2.png",
    price: 8200000,
    description: "Raw birdnest, 200g pack.",
    type: "Raw Nest",
    origin: "Kien Giang",
    weight: 200,
  },
  {
    name: "Feather-removed Birdnest 50g",
    image: "/images/p3.png",
    price: 2100000,
    description: "Feather-removed birdnest, 50g pack.",
    type: "Feather-removed Nest",
    origin: "Kien Giang",
    weight: 50,
  },
];

const nestTypes = ["Refined Nest", "Raw Nest", "Feather-removed Nest"];
const weights = [50, 100, 200];
const minPrice = 0;
const maxPrice = 10000000;
const PRODUCTS_PER_PAGE = 8;

// ProductsHeader component for consistent navbar, improved for mobile
function ProductsHeader({ search, setSearch, setCurrentPage, cartCount, cartBounce }: { search: string; setSearch: (v: string) => void; setCurrentPage: (n: number) => void; cartCount: number; cartBounce: boolean }) {
  const session = null;
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  React.useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between py-2 px-2 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-red-700 tracking-wide">
          <Image src="/images/logo.png" alt="Birdnest Shop Logo" width={36} height={36} className="md:w-10 md:h-10 w-9 h-9" />
          <span className="hidden sm:inline">Birdnest Shop</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-lg">
          <Link href="/" className="hover:text-yellow-600 transition">Home</Link>
          <Link href="/products" className="hover:text-yellow-600 transition">Products</Link>
          <Link href="/about" className="hover:text-yellow-600 transition">About</Link>
          <Link href="/contact" className="hover:text-yellow-600 transition">Contact</Link>
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Icon (mobile) */}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setShowSearch(true)}>
            <Search className="w-5 h-5 text-gray-500" />
          </Button>
          {/* Search Bar (desktop) */}
          <form
            action="#"
            method="get"
            className="hidden md:flex flex-1 mx-4 max-w-xs items-center"
            onSubmit={e => { e.preventDefault(); }}
          >
            <input
              type="text"
              name="query"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            <Button type="submit" size="icon" variant="ghost" className="ml-2">
              <Search className="w-5 h-5 text-gray-500" />
            </Button>
          </form>
          {/* Cart Icon + Badge (animated together) */}
          <Link href="/cart" className="relative">
            <motion.span
              animate={cartBounce ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
              className="inline-block relative"
              style={{ display: "inline-block" }}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-red-700 transition" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: cartBounce ? 1.15 : 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, duration: 0.25 }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center select-none shadow"
                  style={{ zIndex: 1, transformOrigin: "center" }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.span>
          </Link>
          {/* User/Profile (icon only on mobile) */}
          {session ? (
            <Button variant="ghost" size="icon" aria-label="User menu">
              <User className="w-6 h-6 text-gray-700" />
            </Button>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/signup" className="hidden md:block">
                <Button variant="default" size="sm">Sign up</Button>
              </Link>
              <Link href="/login" className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Login">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </>
          )}
          {/* Hamburger menu (mobile) */}
          <Button variant="outline" size="icon" aria-label="Open menu" className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </Button>
        </div>
      </div>
      {/* Mobile Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center">
          <div className="bg-white rounded-lg shadow-lg mt-16 w-[95vw] max-w-md p-4 flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              name="query"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            <Button type="button" variant="outline" onClick={() => setShowSearch(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default function ProductsPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [price, setPrice] = useState<number>(maxPrice);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Add search keyword state (for demo, not yet functional)
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(2); // initial value for demo
  const [cartBounce, setCartBounce] = useState(false);

  // Add to cart handler
  const handleAddToCart = (product: typeof products[0]) => {
    setCartCount((prev) => prev + 1);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
    if (toast) {
      toast.success(`${product.name} added to cart!`);
    } else {
      alert(`${product.name} added to cart!`);
    }
  };

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const weightMatch = selectedWeights.length === 0 || selectedWeights.includes(product.weight);
    const priceMatch = product.price <= price;
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.type.toLowerCase().includes(search.toLowerCase()) ||
      product.origin.toLowerCase().includes(search.toLowerCase()) ||
      product.weight.toString().includes(search);
    return typeMatch && weightMatch && priceMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Handlers
  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };
  const handleWeightChange = (weight: number) => {
    setSelectedWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight]
    );
    setCurrentPage(1);
  };
  const handlePriceChange = (value: number[]) => {
    setPrice(value[0]);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Reset filters and search
  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedWeights([]);
    setPrice(maxPrice);
    setSearch("");
    setCurrentPage(1);
  };

  // Sidebar filter content as a component for reuse
  const FilterContent = (
    <>
      <h2 className="text-lg font-semibold md:hidden mb-2">Filters</h2>
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="type">
          <AccordionTrigger>Type</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {nestTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeChange(type)}
                    id={`type-${type}`}
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="weight">
          <AccordionTrigger>Weight</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {weights.map((weight) => (
                <label key={weight} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedWeights.includes(weight)}
                    onCheckedChange={() => handleWeightChange(weight)}
                    id={`weight-${weight}`}
                  />
                  <span className="text-sm">{weight}g</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <Slider
                min={minPrice}
                max={maxPrice}
                value={[price]}
                onValueChange={handlePriceChange}
                step={100000}
              />
              <div className="flex justify-between text-xs mt-1">
                <span>0₫</span>
                <span>{price.toLocaleString()}₫</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="ghost" size="sm" className="text-xs px-2 py-1 mt-4 w-full" onClick={handleResetFilters}>Reset</Button>
    </>
  );

  // Compose search summary
  const resultSummary = (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
        {search && (
          <>
            {" "}for <span className="font-semibold text-gray-900">‘{search}’</span>
          </>
        )}
      </div>
      {/* (Optional) Search input for demo, not yet functional */}
      {/* <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products..."
        className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      /> */}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <ProductsHeader search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} cartCount={cartCount} cartBounce={cartBounce} />
      {/* Mobile Filter Button at top, above catalog title/results */}
      <div className="md:hidden w-full flex justify-end px-2 pt-2 pb-1 sticky top-[56px] z-20 bg-white border-b">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="py-2 px-4 text-base">Filters</Button>
          </DrawerTrigger>
          <DrawerContent className="max-w-sm mx-auto rounded-t-lg">
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8">{FilterContent}</div>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full mb-4 py-3 text-base">Close</Button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="flex-1 flex w-full">
        {/* Sidebar Filters (desktop) */}
        <aside className="w-72 bg-gray-50 border-r p-6 hidden md:block">
          {FilterContent}
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Products Catalog</h1>
          {resultSummary}
          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="group transition-transform duration-200">
                  <Skeleton className="w-full aspect-[4/3] mb-2 sm:mb-3 rounded-xl" />
                  <Skeleton className="h-5 w-3/4 mb-1 sm:mb-2 rounded" />
                  <Skeleton className="h-4 w-1/2 mb-1 sm:mb-2 rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-1/2 rounded" />
                    <Skeleton className="h-8 w-1/2 rounded" />
                  </div>
                </div>
              ))
            ) : paginatedProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No products found.</div>
            ) : (
              paginatedProducts.map((product, i) => (
                <Card
                  key={i}
                  className="group transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
                >
                  <CardContent className="p-0">
                    <AspectRatio ratio={4/3} className="overflow-hidden rounded-t-xl">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover w-full h-full group-hover:opacity-90 transition duration-200"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </AspectRatio>
                  </CardContent>
                  <div className="px-2 py-2 sm:px-4 sm:py-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 mb-0">
                        {product.name}
                      </CardTitle>
                      <span className="text-xs text-gray-500 font-medium">{product.weight}g</span>
                    </div>
                    <div className="font-bold text-red-700 text-base sm:text-lg mb-1">{product.price.toLocaleString()}₫</div>
                    <div className="flex gap-2 mt-2">
                      {/* Mobile: icon buttons, Desktop: text buttons */}
                      <Button className="flex-1 py-2 text-xs sm:text-sm md:hidden" size="icon" aria-label="Add to Cart" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="w-5 h-5" />
                      </Button>
                      <Button className="flex-1 py-2 text-xs sm:text-sm md:hidden" size="icon" variant="outline" aria-label="View Details">
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button className="flex-1 py-2 text-xs sm:text-sm hidden md:block" size="sm" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </Button>
                      <Button className="flex-1 py-2 text-xs sm:text-sm hidden md:block" size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex justify-center mt-8 gap-1">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : 0}
                    onClick={currentPage === 1 ? undefined : handlePrev}
                    href="#"
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, idx) => (
                  <PaginationItem key={idx + 1}>
                    <PaginationLink
                      isActive={currentPage === idx + 1}
                      onClick={() => handlePageChange(idx + 1)}
                      href="#"
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : 0}
                    onClick={currentPage === totalPages ? undefined : handleNext}
                    href="#"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 