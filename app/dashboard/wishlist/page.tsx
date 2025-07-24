import { LoadingOrEmpty } from "@/components/ui/LoadingOrEmpty";

export default function WishlistPage() {
  // Placeholder loading state
  const loading = false;
  return (
    <div className="py-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      <LoadingOrEmpty loading={loading} emptyText="No favorite products yet.">
        {/* TODO: Wishlist product cards go here */}
        <div className="text-gray-400">Wishlist placeholder</div>
      </LoadingOrEmpty>
    </div>
  );
} 