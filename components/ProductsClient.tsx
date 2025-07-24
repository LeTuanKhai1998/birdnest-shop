"use client";
import React, { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
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
import { ShoppingCart, Eye } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";

const nestTypes = ["Refined Nest", "Raw Nest", "Feather-removed Nest"];
const weights = [50, 100, 200];
const minPrice = 0;
const maxPrice = 10000000;
const PRODUCTS_PER_PAGE = 8;

export default function ProductsClient({ products }: { products: any[] }) {
  const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [price, setPrice] = useState<number>(maxPrice);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type ?? "");
    const weightMatch = selectedWeights.length === 0 || selectedWeights.includes(product.weight);
    const priceMatch = product.price <= price;
    const searchMatch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      (product.type ? product.type.toLowerCase().includes(search.toLowerCase()) : false) ||
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
  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedWeights([]);
    setPrice(maxPrice);
    setSearch("");
    setCurrentPage(1);
  };

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
                <span>{currencyFormatter.format(price)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="ghost" size="sm" className="text-xs px-2 py-1 mt-4 w-full" onClick={handleResetFilters}>Reset</Button>
    </>
  );

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
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <div className="w-full flex justify-end px-2 pt-2 pb-1 sticky top-[56px] z-20 bg-white border-b md:hidden">
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
      <main className="flex-1 p-2 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Products Catalog</h1>
        {resultSummary}
        <div className="flex w-full gap-6">
          <aside className="w-72 bg-gray-50 border-r p-6 hidden md:block flex-shrink-0">
            {FilterContent}
          </aside>
          <div className="flex-1">
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
                  <ProductCard key={i} product={product} />
                ))
              )}
            </div>
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
          </div>
        </div>
      </main>
    </div>
  );
} 