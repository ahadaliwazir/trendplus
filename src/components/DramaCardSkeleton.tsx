import { Skeleton } from "@/components/ui/skeleton";

export function DramaCardSkeleton() {
    return (
        <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 h-full flex flex-col">
            {/* Poster Skeleton */}
            <div className="relative aspect-[2/3] overflow-hidden">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5 line-clamp-1">
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-md" />
                </div>
            </div>
        </div>
    );
}
