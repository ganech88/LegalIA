import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-4 md:px-6 lg:px-10 py-8 space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-2/3 max-w-[520px]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
