import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Plus, Check, ThumbsUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { useList } from '@/hooks/use-list';
import { api } from '@/services/api';
import { episodeService } from '@/services/episodeService';

const DramaDetailModal = () => {
    const { isOpen, activeDrama, closeModal } = useDramaModal();
    const { addToMyList, removeFromMyList, isInList } = useList();
    const [mount, setMount] = useState(false);
    const [actorIds, setActorIds] = useState<{ [name: string]: number }>({});
    const [visibleEpisodes, setVisibleEpisodes] = useState(10);
    const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<any>(null);

    // Helper to extract YouTube ID from URL
    const getYouTubeId = (url: string) => {
        if (!url) return null;
        // Trim and clean URL
        const cleanUrl = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Handle Watch Now - opens YouTube in new tab
    const handleWatchNow = () => {
        if (!activeDrama) return;

        // If we have episodes, play the first one
        if (episodes.length > 0) {
            handlePlayEpisode(episodes[0]);
            return;
        }

        // If drama has a valid trailer URL (YouTube video), open it
        if (activeDrama.trailerUrl && activeDrama.trailerUrl.includes('youtube.com/watch')) {
            window.open(activeDrama.trailerUrl, '_blank');
        } else {
            // Otherwise, search for the drama on YouTube
            const searchQuery = encodeURIComponent(`${activeDrama.title} Pakistani Drama Full Episode`);
            window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
        }
    };

    const handlePlayTrailer = () => {
        setIsPlayingTrailer(true);
        setCurrentEpisode(null);
    };

    const handlePlayEpisode = (episode: any) => {
        setCurrentEpisode(episode);
        setIsPlayingTrailer(false);
        // Scroll to top to show player
        // Scroll to top to show player
        const scrollContainer = document.getElementById('drama-detail-scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    };

    const handleCloseVideo = () => {
        setIsPlayingTrailer(false);
        setCurrentEpisode(null);
    };

    // Hydration fix for dialog
    useEffect(() => {
        setMount(true);
    }, []);

    // Fetch actor IDs for cast names and Episodes
    useEffect(() => {
        if (activeDrama) {
            // Fetch Episodes
            episodeService.getByDramaId(activeDrama.id)
                .then(data => setEpisodes(data))
                .catch(err => console.error("Failed to load episodes", err));

            // Fetch Actors
            if (activeDrama.cast && activeDrama.cast.length > 0) {
                const fetchActorIds = async () => {
                    const ids: { [name: string]: number } = {};
                    for (const name of activeDrama.cast.slice(0, 5)) {
                        try {
                            const response = await api.get<{ actor: { id: number } }>(`/actors/by-name/${encodeURIComponent(name)}`);
                            if (response.data?.actor?.id) {
                                ids[name] = response.data.actor.id;
                            }
                        } catch (e) {
                            // Actor not found, skip
                        }
                    }
                    setActorIds(ids);
                }
                fetchActorIds();
            }
        }
        setVisibleEpisodes(10); // Reset pagination on drama change
        setIsPlayingTrailer(false); // Reset trailer state on drama change
        setCurrentEpisode(null);
        setEpisodes([]);
    }, [activeDrama]);

    if (!mount) return null;
    if (!activeDrama) return null;

    const isAdded = isInList(activeDrama.id);

    const toggleList = () => {
        if (isAdded) {
            removeFromMyList(activeDrama.id);
        } else {
            addToMyList(activeDrama);
        }
    };

    // Random "Match" percentage for Netflix feel
    const matchScore = Math.floor(Math.random() * (99 - 85) + 85);

    // Determine what to show in the player area
    const showPlayer = isPlayingTrailer || currentEpisode;
    const videoUrl = currentEpisode ? currentEpisode.video_url : activeDrama.trailerUrl;
    const videoTitle = currentEpisode
        ? `${activeDrama.title} - Episode ${currentEpisode.episode_number}`
        : `${activeDrama.title} OST`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
            {/* Mobile: w-[90%] with max-height constraint, Desktop: max-w-[850px] */}
            <DialogContent className="w-[90%] md:w-full max-w-[850px] p-0 overflow-hidden bg-[#141414] border-[#2a2a2a] text-white gap-0 shadow-2xl [&>button]:hidden rounded-lg md:rounded-xl">
                {/* Close Button - High Z-index, Absolute positioning */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[500]">
                    <button
                        onClick={closeModal}
                        className="p-2 bg-black/60 hover:bg-black/80 md:bg-[#181818] rounded-full text-white/90 hover:text-white transition-all shadow-lg border border-white/10 backdrop-blur-sm"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 md:w-5 md:h-5" />
                    </button>
                </div>

                <div id="drama-detail-scroll-container" className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Hero Image Section */}
                    <div className="relative aspect-video w-full bg-black group-video">
                        <div className="absolute inset-0">
                            {showPlayer && getYouTubeId(videoUrl) ? (
                                <div className="absolute inset-0 z-0">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                                        title={videoTitle}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                    {/* Overlay for trailer mode to still show title gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent pointer-events-none" />

                                    {/* Close Player Button */}
                                    <button
                                        onClick={handleCloseVideo}
                                        className="absolute top-4 left-4 z-50 bg-[#181818]/60 hover:bg-white/20 p-2 rounded-full transition-colors text-white border border-white/20"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={activeDrama.image}
                                        alt={activeDrama.title}
                                        className="w-full h-full object-contain bg-black"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                                </>
                            )}
                        </div>

                        {/* Hero Content Overlay */}
                        {!showPlayer && (
                            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-12 pb-6 space-y-3 md:space-y-4">
                                <h2 className="text-2xl md:text-5xl font-black font-display text-white drop-shadow-lg mb-2 leading-tight">
                                    {activeDrama.title.toUpperCase()}
                                </h2>

                                <div className="flex items-center gap-3">
                                    <Button
                                        className="bg-white text-black hover:bg-white/90 font-bold px-8 py-6 rounded-md text-lg gap-2"
                                        onClick={handleWatchNow}
                                    >
                                        <Play className="w-6 h-6 fill-black" />
                                        {episodes.length > 0 ? "Watch Episode 1" : "Watch Full Episodes"}
                                    </Button>

                                    {activeDrama.trailerUrl && (
                                        <Button
                                            variant="outline"
                                            className="bg-[#2a2a2a]/60 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-md text-lg gap-2"
                                            onClick={handlePlayTrailer}
                                        >
                                            Watch OST
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        onClick={toggleList}
                                        className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[#2a2a2a]/60 backdrop-blur-sm"
                                    >
                                        {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-[#2a2a2a]/60 backdrop-blur-sm"
                                    >
                                        <ThumbsUp className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta & Synopsis Section */}
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 md:gap-8 p-5 md:p-12 pt-4">
                        <div className="space-y-6">
                            {/* Metadata Row */}
                            <div className="flex items-center flex-wrap gap-3 text-sm font-medium">
                                <span className="text-emerald-400 font-bold text-base">{matchScore}% Match</span>
                                <span className="text-white/60">{activeDrama.year}</span>
                                <Badge variant="outline" className="border-white/40 text-white/90 text-[10px] px-1 py-0 rounded-sm">
                                    HD
                                </Badge>
                                {activeDrama.status === 'airing' && (
                                    <Badge className="bg-primary hover:bg-primary text-[10px]">NEW EPISODES</Badge>
                                )}
                                <span className="bg-transparent border border-white/40 text-white/80 px-1.5 text-[11px]">PG-13</span>
                            </div>

                            {/* Synopsis */}
                            <p className="text-base md:text-lg leading-relaxed text-white">
                                {activeDrama.synopsis || "Witness this compelling story of love, betrayal, and redemption. A masterpiece that has captivated audiences nationwide with its stellar performances and gripping narrative."}
                            </p>
                        </div>

                        {/* Side Details */}
                        <div className="space-y-4 text-sm">
                            {activeDrama.cast?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-white/40">Cast:</span>
                                    {activeDrama.cast.slice(0, 3).map((name, i) => (
                                        actorIds[name] ? (
                                            <Link
                                                key={i}
                                                to={`/actor/${actorIds[name]}`}
                                                onClick={closeModal}
                                                className="text-white hover:text-primary hover:underline"
                                            >
                                                {name}{i < Math.min(activeDrama.cast.length, 3) - 1 ? ',' : ''}
                                            </Link>
                                        ) : (
                                            <span key={i} className="text-white">
                                                {name}{i < Math.min(activeDrama.cast.length, 3) - 1 ? ',' : ''}
                                            </span>
                                        )
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                                <span className="text-white/40">Genres:</span>
                                {activeDrama.genre?.length > 0 ? activeDrama.genre.map((g, i) => (
                                    <span key={i} className="text-white hover:underline cursor-pointer">
                                        {g}{i < activeDrama.genre.length - 1 ? ',' : ''}
                                    </span>
                                )) : <span className="text-white/60">Not available</span>}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                <span className="text-white/40">Connect:</span>
                                <span className="text-white hover:underline cursor-pointer">{activeDrama.channel || 'Hum TV'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Episodes / More Like This Tabs */}
                    <div className="px-5 md:px-12 pb-12">
                        <Tabs defaultValue="episodes" className="w-full">
                            <TabsList className="bg-transparent border-t border-white/20 w-full justify-start rounded-none h-auto p-0 gap-4 md:gap-6 overflow-x-auto scrollbar-hide flex-nowrap">
                                <TabsTrigger
                                    value="episodes"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-t-4 data-[state=active]:border-primary data-[state=active]:text-white text-sm md:text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-wide hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                                >
                                    Episodes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="more"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-t-4 data-[state=active]:border-primary data-[state=active]:text-white text-sm md:text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-wide hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                                >
                                    More Like This
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="data-[state=active]:bg-transparent data-[state=active]:border-t-4 data-[state=active]:border-primary data-[state=active]:text-white text-sm md:text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-wide hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                                >
                                    Reviews
                                </TabsTrigger>
                            </TabsList>

                            {/* Episodes Tab Content */}
                            <TabsContent value="episodes" className="mt-8 space-y-4">
                                <div className="flex items-center justify-between text-white/90 pb-2">
                                    <h3 className="text-lg font-bold">Season 1</h3>
                                    <span className="text-sm text-white/50">{episodes.length > 0 ? episodes.length : activeDrama.episodes} Episodes</span>
                                </div>

                                {episodes.length > 0 ? (
                                    // REAL EPISODES LIST
                                    episodes.map((episode) => (
                                        <div
                                            key={episode.id}
                                            onClick={() => handlePlayEpisode(episode)}
                                            className={`flex items-center gap-4 p-4 rounded-md hover:bg-[#333] transition-colors group cursor-pointer border-b border-white/10 last:border-0 ${currentEpisode?.id === episode.id ? 'bg-[#333]' : ''}`}
                                        >
                                            <div className="text-xl font-bold text-white/40 w-6">{episode.episode_number}</div>
                                            <div className="relative w-32 aspect-video bg-[#222] rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={episode.thumbnail_url || activeDrama.image}
                                                    alt={`Episode ${episode.episode_number}`}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-8 h-8 fill-white text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`font-bold transition-colors ${currentEpisode?.id === episode.id ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                                                        Episode {episode.episode_number}
                                                    </h4>
                                                    {episode.duration && <span className="text-sm text-white/40">{episode.duration}m</span>}
                                                </div>
                                                <p className="text-sm text-white/60 line-clamp-2">
                                                    {episode.description || activeDrama.synopsis || `Watch ${activeDrama.title} Episode ${episode.episode_number}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // FALLBACK / PLACEHOLDER LIST (Original Behavior)
                                    Array.from({ length: Math.min(visibleEpisodes, activeDrama.episodes || 10) }).map((_, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                const searchQuery = encodeURIComponent(`${activeDrama.title} Episode ${i + 1} Pakistani Drama`);
                                                window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
                                            }}
                                            className="flex items-center gap-4 p-4 rounded-md hover:bg-[#333] transition-colors group cursor-pointer border-b border-white/10 last:border-0"
                                        >
                                            <div className="text-xl font-bold text-white/40 w-6">{i + 1}</div>
                                            <div className="relative w-32 aspect-video bg-[#222] rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={activeDrama.image}
                                                    alt={`Episode ${i + 1}`}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-8 h-8 fill-white text-white drop-shadow-md" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors">Episode {i + 1}</h4>
                                                    <span className="text-sm text-white/40">42m</span>
                                                </div>
                                                <p className="text-sm text-white/60 line-clamp-2">
                                                    The story continues as secrets are revealed and alliances are tested. A turning point in the lives of our characters.
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {(episodes.length === 0 && visibleEpisodes < (activeDrama.episodes || 0)) && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setVisibleEpisodes(prev => prev + 20)}
                                        className="w-full py-6 text-white/50 hover:text-white hover:bg-white/5 uppercase tracking-widest text-sm font-bold"
                                    >
                                        Show More Episodes
                                    </Button>
                                )}
                            </TabsContent>

                            {/* ... Rest of tabs ... */}

                            {/* Reviews Tab Content */}
                            <TabsContent value="reviews" className="mt-8">
                                <ReviewSection dramaId={activeDrama.id} />
                            </TabsContent>

                            {/* More Like This Tab Content */}
                            <TabsContent value="more" className="mt-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Placeholder similar content */}
                                    <div className="bg-[#2f2f2f] rounded-md overflow-hidden p-3 h-48 flex items-center justify-center text-white/20">
                                        Similar Content #1
                                    </div>
                                    <div className="bg-[#2f2f2f] rounded-md overflow-hidden p-3 h-48 flex items-center justify-center text-white/20">
                                        Similar Content #2
                                    </div>
                                    <div className="bg-[#2f2f2f] rounded-md overflow-hidden p-3 h-48 flex items-center justify-center text-white/20">
                                        Similar Content #3
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Review Section Component
import { reviewService, UserReview } from '@/services/reviewService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth-context';
import { ReviewCard } from '@/components/ReviewCard';

const ReviewSection = ({ dramaId }: { dramaId: number }) => {
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadReviews();
    }, [dramaId]);

    const loadReviews = async () => {
        try {
            const data = await reviewService.getDramaReviews(dramaId);
            setReviews(data.reviews);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to post review");
            return;
        }
        setIsSubmitting(true);
        try {
            const review = await reviewService.createReview({
                drama_id: dramaId,
                content: newReview,
                rating
            });
            setReviews(prev => [review, ...prev]);
            setNewReview('');
            toast.success('Review posted!');
        } catch (error: any) {
            // Show actual error message from backend (API uses fetch, throws {message} directly)
            const message = error?.message || 'Failed to post review';
            toast.error(message);

            // Handle force logout for banned users
            if (error?.force_logout) {
                setTimeout(() => {
                    localStorage.removeItem('dramalist_token');
                    window.location.href = '/login';
                }, 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Review Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="bg-[#222] p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-white">Write a Review</h3>
                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-0.5 md:gap-1 flex-wrap">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    onClick={() => setRating(i + 1)}
                                    className={`w-7 h-7 md:w-6 md:h-6 p-1 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                                        }`}
                                >
                                    <Star className="w-full h-full" />
                                </button>
                            ))}
                            <span className="ml-2 text-white font-bold self-center">{rating}/10</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Your Review</Label>
                        <Textarea
                            placeholder="What did you think about this drama?"
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="bg-[#333] border-none text-white min-h-[100px]"
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} variant="gold">
                        {isSubmitting ? 'Posting...' : 'Post Review'}
                    </Button>
                </form>
            ) : (
                <div className="bg-[#222] p-6 rounded-lg text-center space-y-4">
                    <Star className="w-12 h-12 mx-auto text-yellow-500/50" />
                    <h3 className="text-lg font-semibold text-white">Share Your Thoughts</h3>
                    <p className="text-white/60">Log in to write a review and rate this drama</p>
                    <Button
                        variant="gold"
                        onClick={() => window.location.href = '/login'}
                        className="mt-2"
                    >
                        Log In to Review
                    </Button>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-white/50 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                )}
            </div>
        </div>
    );
};

export default DramaDetailModal;
