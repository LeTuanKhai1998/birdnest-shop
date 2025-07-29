export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Unauthorized</h1>
      <p className="text-gray-600 text-lg text-center max-w-xl">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
