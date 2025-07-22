"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
const origins = ["Kien Giang"];
const weights = [50, 100, 200];
const minPrice = 0;
const maxPrice = 10000000;
const PRODUCTS_PER_PAGE = 8;

export default function ProductsPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [price, setPrice] = useState<number>(maxPrice);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const originMatch = selectedOrigins.length === 0 || selectedOrigins.includes(product.origin);
    const weightMatch = selectedWeights.length === 0 || selectedWeights.includes(product.weight);
    const priceMatch = product.price <= price;
    return typeMatch && originMatch && weightMatch && priceMatch;
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
  const handleOriginChange = (origin: string) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
    setCurrentPage(1);
  };
  const handleWeightChange = (weight: number) => {
    setSelectedWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight]
    );
    setCurrentPage(1);
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
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

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-gray-50 border-r p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Nest Type</h3>
          <ul className="space-y-1">
            {nestTypes.map((type) => (
              <li key={type}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  {type}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Origin</h3>
          <ul className="space-y-1">
            {origins.map((origin) => (
              <li key={origin}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOrigins.includes(origin)}
                    onChange={() => handleOriginChange(origin)}
                  />
                  {origin}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Weight</h3>
          <ul className="space-y-1">
            {weights.map((weight) => (
              <li key={weight}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedWeights.includes(weight)}
                    onChange={() => handleWeightChange(weight)}
                  />
                  {weight}g
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price Range</h3>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={price}
            onChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>0₫</span>
            <span>{price.toLocaleString()}₫</span>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Products Catalog</h1>
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No products found.</div>
          ) : (
            paginatedProducts.map((product, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={4/3} className="mb-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </AspectRatio>
                  <div className="text-gray-600 mb-2 text-sm">{product.description}</div>
                  <div className="font-bold text-red-700 mb-2 text-lg">{product.price.toLocaleString()}₫</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        {/* Pagination controls */}
        <div className="flex justify-center mt-8 gap-1">
          <Button variant="outline" className="mx-1" onClick={handlePrev} disabled={currentPage === 1}>Previous</Button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <Button
              key={idx + 1}
              variant={currentPage === idx + 1 ? "default" : "outline"}
              className="mx-1"
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </Button>
          ))}
          <Button variant="outline" className="mx-1" onClick={handleNext} disabled={currentPage === totalPages}>Next</Button>
        </div>
      </main>
    </div>
  );
} 