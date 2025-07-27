import { Skeleton } from "@/components/ui/skeleton";
 
export function LoadingOrEmpty({ loading, empty, children, emptyText }: { loading?: boolean; empty?: boolean; children?: React.ReactNode; emptyText?: string }) {
  if (loading) return <div className="flex flex-col gap-4 items-center py-12"><Skeleton className="w-24 h-24 rounded-full" /><div className="w-40 h-6 bg-gray-200 rounded" /></div>;
  if (empty) return <div className="text-center text-gray-400 py-12">{emptyText || "Nothing to show."}</div>;
  return <>{children}</>;
} 