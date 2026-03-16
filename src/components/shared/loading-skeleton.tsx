import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  rows?: number;
  showHeader?: boolean;
}

export function LoadingSkeleton({
  rows = 5,
  showHeader = true,
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      )}

      <div className="rounded-none border">
        {/* Table header skeleton */}
        <div className="flex gap-4 border-b px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 border-b px-4 py-3 last:border-b-0"
          >
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1"
                style={{ maxWidth: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
