import { Star, StarOff, MessageCircle } from "lucide-react";

function formatSold(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
}

export default function ProductMeta({ rating, reviewCount, soldCount, className = "" }: {
  rating: number;
  reviewCount?: number;
  soldCount?: number;
  className?: string;
}) {
  // Show full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className={`text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mt-1 ${className}`}>
      <span className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-yellow-500" />)}
        {halfStar && <Star className="w-4 h-4 fill-yellow-200 stroke-yellow-400 opacity-80" />}
        {[...Array(emptyStars)].map((_, i) => <StarOff key={i} className="w-4 h-4 stroke-gray-300" />)}
        <span className="ml-1 font-medium">{rating.toFixed(1)}</span>
      </span>
      {soldCount !== undefined && (
        <span className="flex items-center gap-1">
          <span className="hidden sm:inline">|</span>
          <span className="sm:ml-0">🔥</span>
          <span>Sold: {formatSold(soldCount)}</span>
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="flex items-center gap-1">
          <span className="hidden sm:inline">|</span>
          <MessageCircle className="w-4 h-4" />
          <span>{reviewCount}</span>
          <span className="hidden sm:inline">reviews</span>
        </span>
      )}
    </div>
  );
} 