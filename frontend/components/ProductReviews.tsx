'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Filter, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Review } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  userReview?: Review | null;
  userHasReviewed: boolean;
  session: any;
  onReviewSubmit?: (review: Review) => void;
  onReviewEdit?: (review: Review) => void;
  productId: string;
}

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest';

const REVIEWS_PER_PAGE = 5;

export default function ProductReviews({
  reviews,
  averageRating,
  totalReviews,
  userReview,
  userHasReviewed,
  session,
  onReviewSubmit,
  onReviewEdit,
  productId,
}: ProductReviewsProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  
  // Edit review state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editing, setEditing] = useState(false);
  
  const router = useRouter();

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [reviews]);

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews;

    // Apply rating filter
    if (filter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(filter));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, filter, sort]);

  // Get visible reviews
  const visibleReviews = filteredAndSortedReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleReviews.length < filteredAndSortedReviews.length;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + REVIEWS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(REVIEWS_PER_PAGE);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Tuyệt vời';
      case 4: return 'Rất tốt';
      case 3: return 'Tốt';
      case 2: return 'Bình thường';
      case 1: return 'Không tốt';
      default: return '';
    }
  };

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 5: return '🥰';
      case 4: return '😄';
      case 3: return '😊';
      case 2: return '😐';
      case 1: return '😞';
      default: return '';
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (reviewRating > 0 && reviewComment.trim()) {
      setSubmitting(true);
      try {
        const newReview = await apiService.createReview({
          productId: productId,
          rating: reviewRating,
          comment: reviewComment,
        });
        
        setReviewRating(0);
        setReviewComment('');
        setSubmitMsg('Đánh giá đã được gửi thành công!');
        toast.success('Đánh giá đã được gửi thành công!');
        setTimeout(() => setSubmitMsg(''), 3000);
        
        // Call the callback if provided
        if (onReviewSubmit) {
          onReviewSubmit(newReview);
        }
      } catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof Error && (error.message.includes('already reviewed') || error.message.includes('User has already reviewed'))) {
          toast.error('Bạn đã đánh giá sản phẩm này rồi. Mỗi sản phẩm chỉ được đánh giá một lần.');
        } else {
          toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle edit review
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditComment(review.comment || '');
    setEditRating(review.rating);
    setEditing(false);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingReview || !editComment.trim()) return;
    
    setEditing(true);
    try {
      const updatedReview = await apiService.updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment
      });
      
      setEditingReview(null);
      setEditComment('');
      setEditRating(0);
      toast.success('Đánh giá đã được cập nhật thành công!');
      
      // Call the callback if provided
      if (onReviewEdit) {
        onReviewEdit(updatedReview);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Có lỗi xảy ra khi cập nhật đánh giá. Vui lòng thử lại.');
    } finally {
      setEditing(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditComment('');
    setEditRating(0);
    setEditing(false);
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
      <CardHeader className="pb-4 md:pb-6 pt-6 md:pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#a10000] to-[#c41e3a] rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                Đánh giá khách hàng
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Chia sẻ trải nghiệm của bạn với sản phẩm này
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-white rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#a10000]">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      star <= averageRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs md:text-sm text-gray-600">
                {totalReviews} đánh giá
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {/* Review Form for authenticated users */}
        {session?.user && !userHasReviewed ? (
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Viết đánh giá</h4>
                  <p className="text-sm text-gray-600">Chia sẻ trải nghiệm của bạn</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Đánh giá của bạn</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-3xl hover:scale-110 transition-transform duration-200 p-1"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">
                        {reviewRating === 1 && '😞 Rất không hài lòng'}
                        {reviewRating === 2 && '😐 Không hài lòng'}
                        {reviewRating === 3 && '😊 Bình thường'}
                        {reviewRating === 4 && '😄 Hài lòng'}
                        {reviewRating === 5 && '🥰 Rất hài lòng'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Nhận xét</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                  />
                </div>
                
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || reviewRating === 0 || !reviewComment.trim()}
                  className="w-full h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white font-semibold rounded-xl hover:from-[#8a0000] hover:to-[#a10000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    'Gửi đánh giá'
                  )}
                </button>
                
                {submitMsg && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {submitMsg}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : !session?.user ? (
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Đăng nhập để viết đánh giá</h4>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                Chia sẻ trải nghiệm của bạn với sản phẩm này để giúp khách hàng khác đưa ra quyết định tốt hơn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                  className="h-12 bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Đăng nhập ngay
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/signup?callbackUrl=' + encodeURIComponent(window.location.pathname))}
                  className="h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Tạo tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* User's Existing Review */}
        {userHasReviewed && userReview && (
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">Đánh giá của bạn</h4>
                  <p className="text-sm text-gray-600">Bạn đã đánh giá sản phẩm này</p>
                </div>
                {!editingReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    aria-label="Chỉnh sửa đánh giá"
                    onClick={() => handleEditReview(userReview)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {editingReview ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Đánh giá của bạn</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            aria-label={`Chọn ${star} sao`}
                            onClick={() => setEditRating(star)}
                            className="text-3xl hover:scale-110 transition-transform duration-200 p-1"
                          >
                            <Star className={`w-8 h-8 ${star <= editRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`} />
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
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Chỉnh sửa nhận xét</label>
                      <textarea
                        value={editComment}
                        onChange={e => setEditComment(e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={editing || !editComment.trim() || editRating === 0}
                        className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold"
                      >
                        {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={editing}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Đánh giá:</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= userReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {userReview.comment && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Nhận xét:</span>
                        <p className="text-sm text-gray-600 mt-1 p-3 bg-white rounded-lg border border-gray-200">
                          "{userReview.comment}"
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Đánh giá vào: {new Date(userReview.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Distribution */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Bars */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Phân bố đánh giá</h4>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[60px]">
                      <span className="text-sm font-medium text-gray-600">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-800 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 min-w-[40px] text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Bộ lọc & Sắp xếp</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? 'Ẩn' : 'Hiện'} bộ lọc
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              {showFilters && (
                <div className="space-y-3 transition-all duration-300 ease-in-out">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Lọc theo đánh giá
                      </label>
                      <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả đánh giá</SelectItem>
                          <SelectItem value="5">5 sao</SelectItem>
                          <SelectItem value="4">4 sao</SelectItem>
                          <SelectItem value="3">3 sao</SelectItem>
                          <SelectItem value="2">2 sao</SelectItem>
                          <SelectItem value="1">1 sao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Sắp xếp theo
                      </label>
                      <Select value={sort} onValueChange={(value: SortType) => setSort(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Mới nhất</SelectItem>
                          <SelectItem value="oldest">Cũ nhất</SelectItem>
                          <SelectItem value="highest">Đánh giá cao nhất</SelectItem>
                          <SelectItem value="lowest">Đánh giá thấp nhất</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(filter !== 'all' || sort !== 'newest') && (
                    <div className="flex flex-wrap gap-2">
                      {filter !== 'all' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {filter} sao
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 text-blue-700 hover:text-blue-800"
                            onClick={() => setFilter('all')}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                      {sort !== 'newest' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {sort === 'oldest' && 'Cũ nhất'}
                          {sort === 'highest' && 'Cao nhất'}
                          {sort === 'lowest' && 'Thấp nhất'}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1 text-green-700 hover:text-green-800"
                            onClick={() => setSort('newest')}
                          >
                            ×
                          </Button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {visibleReviews.length > 0 ? (
            <>
              {visibleReviews.map((review) => {
                const isUserReview = session?.user?.id === review.userId;
                const isEditing = editingReview?.id === review.id;
                
                return (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(review.user?.name || 'K').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{review.user?.name || 'Khách hàng'}</span>
                            {isUserReview && (
                              <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                Bạn
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-500 ml-1">
                                {getRatingEmoji(review.rating)} {getRatingLabel(review.rating)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-[#a10000]">
                          {review.rating}.0
                        </div>
                        {isUserReview && !isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Chỉnh sửa
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Đánh giá của bạn</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="text-3xl hover:scale-110 transition-transform duration-200 p-1"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= editRating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 hover:text-yellow-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {editRating > 0 && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm font-medium text-yellow-800">
                                {editRating === 1 && '😞 Rất không hài lòng'}
                                {editRating === 2 && '😐 Không hài lòng'}
                                {editRating === 3 && '😊 Bình thường'}
                                {editRating === 4 && '😄 Hài lòng'}
                                {editRating === 5 && '🥰 Rất hài lòng'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Chỉnh sửa nhận xét</label>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={editing || !editComment.trim() || editRating === 0}
                            className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] hover:from-[#8a0000] hover:to-[#a10000] text-white font-semibold"
                          >
                            {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={editing}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      review.comment && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}

              {/* Show More/Less Buttons */}
              <div className="flex justify-center pt-4">
                {hasMoreReviews ? (
                  <Button
                    onClick={handleShowMore}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Xem thêm {Math.min(REVIEWS_PER_PAGE, filteredAndSortedReviews.length - visibleCount)} đánh giá
                  </Button>
                ) : visibleCount > REVIEWS_PER_PAGE && (
                  <Button
                    onClick={handleShowLess}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Thu gọn
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-yellow-200">
                <Star className="w-12 h-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {filter !== 'all' ? `Không có đánh giá ${filter} sao` : 'Chưa có đánh giá nào'}
              </h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                {filter !== 'all' 
                  ? `Chưa có đánh giá ${filter} sao cho sản phẩm này.`
                  : 'Hãy là người đầu tiên đánh giá sản phẩm này và chia sẻ trải nghiệm của bạn!'
                }
              </p>
              {filter !== 'all' && (
                <Button
                  onClick={() => setFilter('all')}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Xem tất cả đánh giá
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 