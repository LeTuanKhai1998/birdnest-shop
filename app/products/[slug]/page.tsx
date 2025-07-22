"use client";

import React from "react";
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

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  // For now, use product name slug (replace spaces with dashes, lowercase)
  const product = products.find(
    p => p.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  const images = product?.images || (product?.image ? [product.image] : []);
  // Review form state (mocked, local only)
  const [reviewRating, setReviewRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState("");
  const [localReviews, setLocalReviews] = React.useState(product?.reviews || []);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitMsg, setSubmitMsg] = React.useState("");
  if (!product) return notFound();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 container mx-auto px-2 py-8 max-w-4xl">
        {/* Image Gallery Modern Layout */}
        <Card className="mb-8 p-4 md:p-8 flex flex-col md:flex-row gap-8 shadow-lg border-0 bg-transparent">
          <div className="flex flex-col w-full items-center md:items-start md:w-[60%]">
            <div className="w-full flex flex-col items-center relative">
              <ProductImageGallery images={images} productName={product.name} />
            </div>
          </div>
          {/* Product info */}
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            <div className="text-lg text-gray-500 mb-2">{product.weight}g</div>
            <div className={`mb-2 text-sm font-medium ${product.quantity === 0 ? 'text-red-500' : 'text-green-600'}`}>{product.quantity === 0 ? 'Out of stock' : `In stock: ${product.quantity}`}</div>
            <div className="text-2xl font-bold text-red-700 mb-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}</div>
            <div className="text-base text-gray-700 mb-4">{product.description}</div>
            {/* Add to Cart */}
            <AddToCartButton className="w-full md:w-auto" disabled={product.quantity === 0}>Add to Cart</AddToCartButton>
          </div>
        </Card>
        {/* Reviews and Ratings Section */}
        <div className="mt-10 bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
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