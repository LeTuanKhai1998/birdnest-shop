'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Edit, Trash2, Eye, Calendar, Package, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export default function DashboardReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch user reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await apiService.getUserReviews();
        setReviews(response);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchReviews();
    }
  }, [session?.user?.id]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview || !editComment.trim() || editRating === 0) return;

    try {
      setSaving(true);
      await apiService.updateReview(editingReview, {
        rating: editRating,
        comment: editComment.trim(),
      });

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === editingReview 
          ? { ...review, rating: editRating, comment: editComment.trim() }
          : review
      ));

      setEditingReview(null);
      setEditRating(0);
      setEditComment('');
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await apiService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Rất không hài lòng';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Rất hài lòng';
      default: return '';
    }
  };

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1: return '😞';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '😍';
      default: return '';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg mb-6 w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Đánh Giá Của Tôi</h1>
                <p className="text-gray-600">Quản lý tất cả đánh giá sản phẩm của bạn</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{reviews.length} đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{session.user?.name || 'Người dùng'}</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Chưa có đánh giá nào
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Bạn chưa đánh giá sản phẩm nào. Hãy mua sản phẩm và chia sẻ trải nghiệm của bạn!
                  </p>
                  <Button 
                    onClick={() => router.push('/products')}
                    className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white"
                  >
                    Khám phá sản phẩm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Product Info */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {review.product.images?.[0] ? (
                          <img 
                            src={review.product.images[0]} 
                            alt={review.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {review.product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/products/${review.product.slug}`)}
                        className="text-[#a10000] hover:text-[#8a0000] hover:bg-red-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem sản phẩm
                      </Button>
                    </div>

                    <Separator className="mb-6" />

                    {/* Review Content */}
                    {editingReview === review.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Đánh giá của bạn
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="text-2xl hover:scale-110 transition-transform duration-200 p-1"
                              >
                                <Star className={`w-6 h-6 ${star <= editRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`} />
                              </button>
                            ))}
                          </div>
                          {editRating > 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm font-medium text-yellow-800">
                                {getRatingEmoji(editRating)} {getRatingLabel(editRating)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Nhận xét
                          </label>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a10000] focus:border-[#a10000] resize-none transition-all duration-200"
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={saving || !editComment.trim() || editRating === 0}
                            className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white"
                          >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Rating Display */}
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {getRatingEmoji(review.rating)} {getRatingLabel(review.rating)}
                          </Badge>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <p className="text-gray-700 italic">"{review.comment}"</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            className="text-[#a10000] border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 