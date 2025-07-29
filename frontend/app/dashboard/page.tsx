export default function DashboardHome() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-gray-600 text-lg text-center max-w-xl">
        Manage your orders, profile, addresses, and wishlist all in one place.
        Use the sidebar to navigate between sections.
      </p>
    </div>
  );
}
