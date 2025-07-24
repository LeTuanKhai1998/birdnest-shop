"use client";

import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AddToCartButton } from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import Image from "next/image";
import { products } from "@/lib/products-data";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import ProductImageGallery from "@/components/ProductImageGallery";
import RelatedProducts from "@/components/RelatedProducts";
import { products as allProducts } from "@/lib/products-data";
import ProductMeta from "@/components/ProductMeta";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Review } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useReducedMotion } from "framer-motion";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const decodedSlug = decodeURIComponent(slug);
  const product = products.find(
    p => p.slug === decodedSlug
  );
  if (!product) return notFound();
  const images = product.images || (product.image ? [product.image] : []);
  // Review form state (mocked, local only)
  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState("");
  const [localReviews, setLocalReviews] = React.useState(product?.reviews || []);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitMsg, setSubmitMsg] = React.useState("");
  const { data: session } = useSession();
  const { isInWishlist, add, remove, loading } = useWishlist();
  const favorited = isInWishlist(product.id);
  if (!product) return notFound();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-4 md:px-0 pt-4 pb-6 max-w-4xl">
        {/* Image Gallery Modern Layout */}
        <Card className="mb-4 p-0 md:p-8 flex flex-col md:flex-row gap-2 md:gap-8 shadow-lg border-0 bg-white rounded-2xl">
          <div className="flex flex-col w-full items-center md:items-start md:w-[60%]">
            <div className="w-full flex flex-col items-center relative gap-1 md:gap-4">
              <ProductImageGallery images={images} productName={product.name} />
              {/* Remove MoreImagesGallery from here */}
            </div>
          </div>
          {/* Product info */}
          <div className="flex-1 flex flex-col gap-1 md:gap-2 justify-center px-4 md:px-0 md:mx-0">
            <div className="flex items-center gap-2 mb-1 md:mb-4">
              <h1 className="text-xl md:text-3xl font-bold break-words leading-tight flex-1">{product.name}</h1>
              {/* Wishlist Heart Button */}
              {session?.user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`rounded-full bg-white/90 shadow p-2 hover:bg-red-50 transition-colors border border-gray-200 ${favorited ? "text-red-600" : "text-gray-400 hover:text-red-500"}`}
                        onClick={e => {
                          e.preventDefault();
                          if (loading) return;
                          favorited ? remove(product.id) : add(product);
                        }}
                        disabled={loading}
                      >
                        <motion.span
                          initial={false}
                          animate={favorited ? {
                            scale: [1, 1.3, 0.95, 1.1, 1],
                            opacity: [1, 1, 1, 1, 1],
                            rotate: [0, 10, -10, 0, 0],
                            color: "#dc2626"
                          } : {
                            scale: [1, 0.8, 1],
                            opacity: [1, 0.7, 1],
                            rotate: [0, -10, 0],
                            color: "#a3a3a3"
                          }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.85 }}
                        >
                          <Heart fill={favorited ? "#dc2626" : "none"} className="w-7 h-7" />
                        </motion.span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{favorited ? "Remove from Wishlist" : "Add to Wishlist"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {/* Info row: Sold, Reviews, Weight */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
              <span className="flex items-center gap-1"><span className="text-orange-500"><svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8.5A2.5 2.5 0 1010 5a2.5 2.5 0 000 5.5z"/></svg></span>{product.sold ?? 0} Sold</span>
              <span className="flex items-center gap-1"><span className="text-yellow-500"><svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg></span>{product.reviews?.length ?? 0} Reviews</span>
              <span className="flex items-center gap-1"><span className="text-blue-500"><svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><text x="10" y="15" textAnchor="middle" fontSize="10" fill="#fff">{product.weight}g</text></svg></span>{product.weight}g</span>
            </div>
            {/* Price and stock badge */}
            <div className="flex items-end gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-2">
              <span className="text-3xl font-bold text-red-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${product.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{product.quantity === 0 ? 'Out of stock' : `In stock: ${product.quantity}`}</span>
            </div>
            {/* Tabbed Details Section */}
            <ProductDetailsTabs product={product} />
            {/* More Images above Add to Cart */}
            <div className="mb-4">
              <MoreImagesGallery product={product} />
            </div>
            {/* Sticky Add to Cart Button for mobile */}
            <div className="block md:hidden fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
              <div className="pointer-events-auto">
                <AddToCartButton product={product} className="w-full rounded-xl shadow-lg py-4 text-lg font-semibold" disabled={product.quantity === 0}>Add to Cart</AddToCartButton>
              </div>
            </div>
            {/* Add to Cart for desktop */}
            <div className="hidden md:block">
              <AddToCartButton product={product} className="w-full md:w-auto" disabled={product.quantity === 0}>Add to Cart</AddToCartButton>
            </div>
          </div>
        </Card>
        {/* Reviews and Ratings Section */}
        <div className="mt-6 mb-4 md:mt-10 md:mb-8 bg-white rounded-xl shadow p-4 md:p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Đánh giá sản phẩm
            {localReviews.length > 0 && (
              <span className="flex items-center gap-1 text-yellow-500 text-lg">
                {(localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length).toFixed(1)}
                <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-500" />
                <span className="text-gray-500 text-base">({localReviews.length} đánh giá)</span>
              </span>
            )}
          </h2>
          {localReviews.length > 0 ? (
            <ul className="space-y-4">
              {localReviews.map((review, idx) => (
                <li key={idx} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{review.user}</span>
                    <span className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 stroke-yellow-500' : 'stroke-gray-300'}`} />
                      ))}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm">{review.comment}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</div>
          )}
          {/* Review Form (mocked, always visible) */}
          <form
            className="mt-8 border-t pt-6"
            onSubmit={e => {
              e.preventDefault();
              if (!reviewRating || !reviewComment.trim()) {
                setSubmitMsg("Vui lòng chọn số sao và nhập nhận xét.");
                return;
              }
              setSubmitting(true);
              setTimeout(() => {
                setLocalReviews([
                  ...localReviews,
                  { user: "Khách hàng ẩn danh", rating: reviewRating, comment: reviewComment }
                ]);
                setReviewRating(0);
                setReviewComment("");
                setSubmitMsg("Cảm ơn bạn đã đánh giá!");
                setSubmitting(false);
                setTimeout(() => setSubmitMsg(""), 2000);
              }, 600);
            }}
          >
            <div className="mb-3">
              <label className="block font-medium mb-1">Đánh giá của bạn:</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                    aria-label={`Chọn ${star} sao`}
                  >
                    <Star className={`w-7 h-7 ${reviewRating >= star ? 'fill-yellow-400 stroke-yellow-500' : 'stroke-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block font-medium mb-1" htmlFor="review-comment">Nhận xét:</label>
              <textarea
                id="review-comment"
                className="w-full border rounded p-2 min-h-[60px]"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                maxLength={300}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                required
              />
            </div>
            {submitMsg && <div className="mb-2 text-sm text-green-600">{submitMsg}</div>}
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        </div>
        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} products={allProducts} />
      </main>
      <Footer />
    </div>
  );
}

function MoreImagesGallery({ product }: { product: Product }) {
  const moreImages = product.images || [];
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  if (moreImages.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold mb-2">More Images</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {moreImages.map((img: string, i: number) => (
          <button key={img} className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 group" onClick={() => { setSelectedIdx(i); setOpen(true); }}>
            <Image src={img} alt={product.name + ' gallery ' + (i+1)} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200" />
          </button>
        ))}
      </div>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          {open && (
            <div
              className="fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 animate-fadeIn cursor-pointer"
              aria-label="Close image zoom"
              tabIndex={-1}
              onClick={() => setOpen(false)}
            />
          )}
          <DialogPrimitive.Content
            className="fixed inset-0 flex items-center justify-center z-50 outline-none transition-transform duration-300 animate-zoomIn p-0 w-screen h-screen max-w-full max-h-full"
            onPointerDownOutside={() => setOpen(false)}
          >
            <DialogPrimitive.Title className="sr-only">Product Image Gallery</DialogPrimitive.Title>
            <div className="relative bg-white rounded-xl shadow-lg w-full h-full max-w-full max-h-full flex flex-col animate-fadeInContent">
              <button onClick={() => setOpen(false)} className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 hover:bg-white transition"><X className="w-6 h-6" /></button>
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-xs text-gray-500 mx-auto">{selectedIdx + 1}/{moreImages.length}</span>
              </div>
              {/* Desktop center arrows */}
              <button
                onClick={() => setSelectedIdx((selectedIdx - 1 + moreImages.length) % moreImages.length)}
                className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition"
                style={{ pointerEvents: 'auto' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-gray-700" />
              </button>
              <button
                onClick={() => setSelectedIdx((selectedIdx + 1) % moreImages.length)}
                className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition"
                style={{ pointerEvents: 'auto' }}
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 text-gray-700" />
              </button>
              <div className="relative w-full flex-1 flex items-center justify-center select-none">
                <AnimatePresence initial={false} custom={selectedIdx}>
                  <motion.div
                    key={selectedIdx}
                    className="absolute inset-0 flex items-center justify-center w-full h-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -80) setSelectedIdx((selectedIdx + 1) % moreImages.length);
                      else if (info.offset.x > 80) setSelectedIdx((selectedIdx - 1 + moreImages.length) % moreImages.length);
                    }}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Image src={moreImages[selectedIdx]} alt="Zoomed" fill className="object-contain w-full h-full rounded-xl transition-transform duration-300" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

// Tabbed details component for mobile-first UI
function ProductDetailsTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState("desc");
  const tabList = [
    { key: "desc", label: "Description" },
    { key: "ingredients", label: "Ingredients" },
    { key: "usage", label: "Usage" },
    { key: "preservation", label: "Preservation" },
  ];
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex gap-2 md:gap-4 border-b border-gray-200 mb-3 overflow-x-auto">
        {tabList.map(t => (
          <button
            key={t.key}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 whitespace-nowrap
              ${tab === t.key ? 'bg-white text-primary shadow font-semibold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            onClick={() => setTab(t.key)}
            type="button"
            aria-selected={tab === t.key}
            tabIndex={tab === t.key ? 0 : -1}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b-xl shadow-sm px-3 py-4 min-h-[60px] text-sm md:text-base">
        {tab === "desc" && (
          <div className="prose prose-sm text-muted-foreground leading-relaxed">{product.description}</div>
        )}
        {tab === "ingredients" && (
          <div className="text-muted-foreground">100% Pure Bird&apos;s Nest, no additives.</div>
        )}
        {tab === "usage" && (
          <div className="text-muted-foreground">Soak in water for 30 minutes, cook with sugar or as desired.</div>
        )}
        {tab === "preservation" && (
          <div className="text-muted-foreground">Store in a cool, dry place. Use within 6 months.</div>
        )}
      </div>
    </div>
  );
} 