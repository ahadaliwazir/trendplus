import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Plus, Check, ListFilter, SlidersHorizontal } from 'lucide-react';
import { useTopRatedDramas, useDramas } from '@/hooks/use-dramas';
import { useList } from '@/hooks/use-list';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDramaModal } from '@/hooks/use-drama-modal';
import SEO from '@/components/SEO';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 20;

const TopRated = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('ranking');

    // Fetch Top Rated with pagination
    const { dramas: apiTopRated, isLoading: topLoading, pagination } = useTopRatedDramas(currentPage, ITEMS_PER_PAGE);

    // Fetch Search Results
    const { dramas: searchResults, isLoading: searchLoading } = useDramas({
        search: searchQuery || '',
        autoFetch: !!searchQuery
    });

    // Get base dramas - no static fallback, only use API data
    const baseDramas = searchQuery ? searchResults : apiTopRated;

    // Sort dramas based on selected option
    const displayDramas = [...baseDramas].sort((a: any, b: any) => {
        switch (sortBy) {
            case 'popularity':
                // Sort by vote count (highest first)
                return (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0);
            case 'year':
                // Sort by year (newest first)
                return (Number(b.year) || 0) - (Number(a.year) || 0);
            case 'rating':
                // Sort by IMDb rating (highest first)
                return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            case 'mdl_ranking':
                // Sort by site rating (user votes on our platform)
                const aRating = Number(a.siteRating) || Number(a.rating) || 0;
                const bRating = Number(b.siteRating) || Number(b.rating) || 0;
                return bRating - aRating;
            case 'ranking':
            default:
                // Keep original order (by rank)
                return 0;
        }
    });

    const isLoading = searchQuery ? searchLoading : topLoading;
    const totalItems = pagination?.total || displayDramas.length;
    const totalPages = pagination?.pages || 1;

    const { openModal } = useDramaModal();
    const { addToMyList, removeFromMyList, isInList } = useList();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const toggleList = (e: React.MouseEvent, drama: any) => {
        e.stopPropagation();
        if (isInList(drama.id)) {
            removeFromMyList(drama.id);
        } else {
            addToMyList(drama);
        }
    };

    // Calculate rank offset based on current page
    const rankOffset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <>
            <SEO
                title={searchQuery ? `Search Results for "${searchQuery}" | MeriDramaList` : 'Best Pakistani Dramas 2026 | Top Rated & Most Popular Lists'}
                description="Ranking the best Pakistani dramas of 2026 and all time. Explore top rated shows by popularity, IMDb rating and user reviews. Find cast details and watch online."
                keywords="best pakistani dramas, top rated pakistani dramas 2026, pakistani drama rankings, most popular pakistani dramas, top 10 pakistani dramas, watch pakistani dramas online"
                url="/top-rated"
            />

            <div className="min-h-screen bg-background text-foreground pb-20">
                <Navbar />

                <div className="container mx-auto px-4 pt-24">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black font-display text-white mb-2">
                                {searchQuery ? `Search Results for "${searchQuery}"` : 'IMDb Top 250 TV Shows'}
                            </h1>
                            <p className="text-muted-foreground">
                                {searchQuery
                                    ? `Found ${displayDramas.length} matches`
                                    : `Showing ${rankOffset + 1}-${Math.min(rankOffset + ITEMS_PER_PAGE, totalItems)} of ${totalItems} dramas`}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[220px] bg-secondary/50 border-none text-white">
                                    <ListFilter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ranking">Ranking</SelectItem>
                                    <SelectItem value="mdl_ranking">Meri Drama List Ranking</SelectItem>
                                    <SelectItem value="rating">IMDb Rating</SelectItem>
                                    <SelectItem value="year">Release Date</SelectItem>
                                    <SelectItem value="popularity">Popularity</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="ghost" size="icon" className="text-white">
                                <SlidersHorizontal className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Chart List */}
                    <div className="flex flex-col gap-0 border border-white/10 rounded-md overflow-hidden bg-card">
                        {/* List Header */}
                        <div className="hidden md:grid grid-cols-[1fr_4fr_1fr_1fr] bg-secondary/30 p-4 text-xs font-bold text-white/50 uppercase tracking-wider">
                            <div className="text-center">Rank & Title</div>
                            <div></div>
                            <div className="text-center">IMDb Rating</div>
                            <div className="text-center">Your Rating</div>
                        </div>

                        {displayDramas.map((drama, index) => (
                            <div
                                key={drama.id}
                                onClick={() => openModal(drama)} // Netflix Modal Trigger
                                className="group flex flex-col md:grid md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                {/* Rank & Image (Mobile Optimized) */}
                                <div className="flex items-center gap-4 w-full md:w-auto self-start">
                                    {/* Poster */}
                                    <div className="relative w-16 h-24 md:w-20 md:h-28 flex-shrink-0 rounded-sm overflow-hidden bg-secondary">
                                        <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-0 left-0 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-sm shadow-md">
                                            #{rankOffset + index + 1}
                                        </div>
                                    </div>

                                    {/* Mobile: Title & Info */}
                                    <div className="flex-1 md:hidden">
                                        <h3 className="font-bold text-base text-white mb-1">{rankOffset + index + 1}. {drama.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                            <span>{drama.year}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                {drama.rating}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 w-full gap-2 text-xs"
                                            onClick={(e) => toggleList(e, drama)}
                                        >
                                            {isInList(drama.id) ? (
                                                <>
                                                    <Check className="w-3 h-3 text-primary" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3 h-3" />
                                                    Watchlist
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Desktop: Title & Metadata */}
                                <div className="hidden md:flex flex-col gap-1 w-full pl-4">
                                    <h3 className="font-bold text-lg text-white hover:text-primary transition-colors cursor-pointer">
                                        {rankOffset + index + 1}. {drama.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-white/50">
                                        <span>{drama.year}</span>
                                        <span>{drama.episodes} eps</span>
                                        <span>TV Series</span>
                                    </div>
                                </div>

                                {/* Desktop: Rating */}
                                <div className="hidden md:flex flex-col items-center gap-1 w-32">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                        <span className="font-bold text-lg text-white">{drama.rating}</span>
                                    </div>
                                    <span className="text-xs text-white/40">{drama.voteCount ? `${drama.voteCount} votes` : ''}</span>
                                </div>

                                {/* Desktop: Actions */}
                                <div className="hidden md:flex justify-end w-40 pr-4">
                                    <Button
                                        variant="ghost"
                                        className={`h-10 w-10 p-0 rounded-full hover:bg-primary/20 hover:text-primary ${isInList(drama.id) ? 'bg-primary/10 text-primary' : 'text-primary'}`}
                                        onClick={(e) => toggleList(e, drama)}
                                    >
                                        {isInList(drama.id) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && !searchQuery && (
                        <div className="mt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {getPageNumbers().map((page, idx) => (
                                        <PaginationItem key={idx}>
                                            {page === 'ellipsis' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    <div className="mt-8 text-center text-sm text-white/40">
                        Shows rankings of top Pakistani dramas based on user ratings.
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopRated;
