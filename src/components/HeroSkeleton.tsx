import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <div className="relative w-full h-[85vh] overflow-hidden bg-background">
            <div className="container mx-auto px-4 relative z-10 pt-28 pb-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 lg:gap-12 pb-12">
                    {/* Poster Skeleton */}
                    <div className="w-48 lg:w-72 flex-shrink-0">
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32 mx-auto lg:mx-0" />
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-16 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-16 lg:h-24 w-full lg:w-3/4 mx-auto lg:mx-0" />
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <Skeleton className="h-14 w-44 rounded-2xl" />
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
