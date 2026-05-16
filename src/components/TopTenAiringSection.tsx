import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Drama } from '@/data/dramas';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { Skeleton } from '@/components/ui/skeleton';

interface TopTenAiringProps {
    dramas: Drama[];
    isLoading?: boolean;
}

const TopTenAiringSection = ({ dramas, isLoading = false }: TopTenAiringProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { openModal } = useDramaModal();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth * 0.6;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (isLoading) {
        return (
            <section className="pt-4 pb-2 relative z-10 px-4">
                <div className="container mx-auto">
                    <Skeleton className="h-8 w-64 mb-6" />
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-none flex items-end gap-2">
                                <Skeleton className="h-[150px] md:h-[200px] w-20 md:w-32 rounded-lg" />
                                <Skeleton className="w-[100px] md:w-[130px] lg:w-[150px] aspect-[2/3] rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (dramas.length === 0) {
        return null;
    }

    return (
        <section className="pt-4 pb-2 relative z-10">
            <div className="mx-auto">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 px-2 md:px-4">
                    Top 10 Airing Today
                </h2>

                <div className="group/row relative">
                    {/* Scroll Buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-[80%] px-2 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                        <ChevronLeft className="w-10 h-10 text-foreground/50 hover:text-foreground" />
                    </button>

                    <div
                        ref={scrollRef}
                        tabIndex={-1}
                        className="flex gap-1 md:gap-2 px-2 md:px-4 overflow-x-auto no-scrollbar pb-4"
                    >
                        {dramas.map((drama, index) => (
                            <div
                                key={drama.id}
                                className="flex-none flex items-end cursor-pointer group/card"
                                onClick={() => openModal(drama)}
                            >
                                {/* Large Number */}
                                <div className="relative flex-shrink-0">
                                    <span
                                        className="text-[100px] md:text-[180px] lg:text-[200px] font-black leading-none select-none transition-colors"
                                        style={{
                                            color: 'transparent',
                                            WebkitTextStroke: '2px hsl(var(--foreground) / 0.2)',
                                            textShadow: '4px 4px 0 hsl(var(--background) / 0.5)',
                                            fontFamily: 'Outfit, sans-serif',
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Drama Poster */}
                                <div className="relative -ml-6 md:-ml-10 mb-2 transform transition-transform duration-300 group-hover/card:scale-105 group-hover/card:z-10">
                                    {/* ... rest unchanged */}
                                    <div
                                        className="w-[100px] md:w-[130px] lg:w-[150px] aspect-[2/3] rounded-md overflow-hidden shadow-xl"
                                        style={{
                                            backgroundImage: `url(${drama.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-[80%] px-2 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                        <ChevronRight className="w-10 h-10 text-foreground/50 hover:text-foreground" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TopTenAiringSection;
