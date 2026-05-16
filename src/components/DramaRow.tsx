import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DramaCard from './DramaCard';
import { Drama } from '@/data/dramas';

interface DramaRowProps {
    dramas: Drama[];
}

const DramaRow = ({ dramas }: DramaRowProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = window.innerWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="group/row relative">
            {/* Scroll Buttons */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-[80%] px-2 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
                <ChevronLeft className="w-10 h-10 text-white" />
            </button>

            <div
                ref={scrollRef}
                className="flex gap-4 px-2 md:px-4 overflow-x-auto no-scrollbar scroll-smooth pb-4"
            >
                {dramas.map((drama, index) => (
                    <div key={drama.id} className="flex-none w-[160px] md:w-[200px] lg:w-[240px]">
                        <DramaCard drama={drama} index={index} />
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-[80%] px-2 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
                <ChevronRight className="w-10 h-10 text-white" />
            </button>
        </div>
    );
};

export default DramaRow;
