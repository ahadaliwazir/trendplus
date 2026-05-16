import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Play, Plus, Check, ThumbsUp, Calendar, Clock, Tv, Share2, ArrowLeft, Filter, ListFilter, X, CheckCircle2, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useList } from '@/hooks/use-list';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { mapApiDramaToFrontend } from '@/services/dramaService';
import { toast } from 'sonner';
import { HeroSkeleton } from '@/components/HeroSkeleton';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommentThread } from '@/components/CommentThread';
import { episodeService } from '@/services/episodeService';
import { UserListModal } from '@/components/UserListModal';
import { useAuth } from '@/hooks/auth-context';

const DramaDetail = () => {
    // ... rest of imports
    const [showTrailer, setShowTrailer] = useState(false);
    // Helper to extract YouTube ID from URL
    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const cleanUrl = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        return id;
    };
    const { idOrSlug } = useParams<{ idOrSlug: string }>();
    const navigate = useNavigate();
    const { userDramas, addToMyList, removeFromMyList, isInList, updateDramaEntry } = useList();
    const [drama, setDrama] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actorIds, setActorIds] = useState<{ [name: string]: number }>({});
    const [visibleEpisodes, setVisibleEpisodes] = useState(12);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<any>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const tabsRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchDrama = async () => {
            setIsLoading(true);
            try {
                const response = await api.get<any>(`/dramas/${idOrSlug}`);
                if (response.success) {
                    const mappedDrama = mapApiDramaToFrontend(response.data.drama);
                    setDrama(mappedDrama);

                    // Fetch actor IDs
                    if (mappedDrama.cast && mappedDrama.cast.length > 0) {
                        const ids: { [name: string]: number } = {};
                        for (const name of mappedDrama.cast.slice(0, 5)) {
                            try {
                                const actorRes = await api.get<any>(`/actors/by-name/${encodeURIComponent(name)}`);
                                if (actorRes.success && actorRes.data?.actor?.id) {
                                    ids[name] = actorRes.data.actor.id;
                                }
                            } catch (e) {
                                // Skip
                            }
                        }
                        setActorIds(ids);
                    }

                    // Fetch Episodes
                    try {
                        const eps = await episodeService.getByDramaId(mappedDrama.id);
                        setEpisodes(eps);
                    } catch (e) {
                        console.error("Failed to fetch episodes", e);
                    }
                }
            } catch (error) {
                console.error('Error fetching drama:', error);
                toast.error('Failed to load drama details');
            } finally {
                setIsLoading(false);
            }
        };

        if (idOrSlug) {
            fetchDrama();
        }
    }, [idOrSlug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <HeroSkeleton />
                <Footer />
            </div>
        );
    }

    if (!drama) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold mb-4">Drama Not Found</h1>
                    <Button onClick={() => navigate('/top-rated')}>Go Back to Explore</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const isAdded = isInList(drama.id);
    const userEntry = userDramas.find(entry => entry.drama_id === drama.id);
    const matchScore = Math.floor(Math.random() * (99 - 85) + 85);

    const toggleList = () => {
        if (isAdded) {
            removeFromMyList(drama.id);
            toast.success('Removed from Watchlist');
        } else {
            addToMyList(drama);
            toast.success('Added to Watchlist');
        }
    };

    const handleWatchNow = () => {
        setActiveTab("episodes");
        setTimeout(() => {
            tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // Generate SEO Metadata
    const seoTitle = `Watch ${drama.title} Drama (${drama.year}) | Full Episodes & Cast`;

    // Create rich description
    const castNames = drama.cast?.slice(0, 5).join(', ') || '';
    const shortSynopsis = drama.synopsis ? drama.synopsis.substring(0, 160) + '...' : '';
    const seoDescription = `Watch ${drama.title} Pakistani Drama full episodes. Starring ${castNames}. ${shortSynopsis} Catch the latest ${drama.channel} drama reviews, ratings and schedule.`;

    // specific keywords
    const seoKeywords = `${drama.title}, ${drama.title} drama, ${drama.title} cast, ${drama.title} episode 1, ${drama.title} last episode, ${castNames}, ${drama.channel} dramas, pakistani drama ${drama.year}, watch ${drama.title} online`;

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords={seoKeywords}
                image={drama.image}
                url={`/drama/${drama.slug || drama.id}`}
                drama={{
                    name: drama.title,
                    image: drama.image,
                    description: drama.synopsis || '',
                    year: Number(drama.year),
                    rating: drama.siteRating || drama.rating,
                    episodes: drama.episodes,
                    genre: drama.genre,
                    cast: drama.cast,
                    channel: drama.channel,
                    episodesList: episodes
                }}
            />
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative w-full min-h-[700px] lg:h-[85vh] overflow-hidden flex flex-col justify-center">
                    {/* Background Image with Blur/Zoom */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={drama.image}
                            alt=""
                            className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
                        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent h-48" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 pt-28 pb-12 lg:pt-28">
                        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 lg:gap-12 pb-12 lg:pb-40">
                            {/* Poster Image */}
                            <div className="w-48 lg:w-72 flex-shrink-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                                    <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-700">
                                <div className="space-y-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/40 hover:text-white pl-0 mb-4 transition-all"
                                        onClick={() => navigate(-1)}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Explore
                                    </Button>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                        <Badge className="bg-primary text-white font-bold px-3 py-1">
                                            {drama.status === 'airing' ? 'AIRING' : 'COMPLETED'}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400/20 backdrop-blur-md">
                                            <Star className="w-4 h-4 fill-yellow-400" />
                                            <span className="font-black">{(drama.siteRating && Number(drama.siteRating) > 0) ? drama.siteRating : drama.rating}</span>
                                        </div>
                                        <span className="text-white/60 font-bold tracking-widest">{drama.year}</span>
                                    </div>

                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display text-white tracking-tighter leading-none drop-shadow-2xl">
                                        {drama.title}
                                    </h1>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 py-2">
                                        {drama.genre?.slice(0, 3).map((g: string, i: number) => (
                                            <span key={i} className="text-white/40 text-sm font-bold uppercase tracking-widest px-3 py-1 border border-white/5 rounded-full bg-white/5">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                    <Button
                                        className="bg-primary text-white hover:bg-primary/90 font-bold px-10 py-8 rounded-2xl text-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                        onClick={handleWatchNow}
                                    >
                                        <Play className="w-7 h-7 fill-white mr-3" />
                                        Watch Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={`w-16 h-16 rounded-2xl border-2 ${isAdded ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white'} backdrop-blur-xl transition-all hover:scale-110`}
                                        onClick={toggleList}
                                    >
                                        {isAdded ? <Check className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-16 h-16 rounded-2xl border-2 bg-white/5 border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110"
                                    >
                                        <Share2 className="w-7 h-7" />
                                    </Button>

                                    <UserListModal
                                        dramaId={drama.id}
                                        trigger={
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="w-16 h-16 rounded-2xl border-2 bg-white/5 border-white/10 text-white backdrop-blur-xl transition-all hover:scale-110"
                                            >
                                                <ListPlus className="w-7 h-7" />
                                            </Button>
                                        }
                                    />

                                    {drama.trailerUrl && (
                                        <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="h-16 px-8 rounded-2xl border-2 bg-primary/20 border-primary text-white backdrop-blur-xl transition-all hover:scale-110 flex items-center gap-3 font-bold"
                                                >
                                                    <Play className="w-6 h-6 fill-current" />
                                                    Watch OST
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl p-0 bg-black border-white/10 overflow-hidden">
                                                <div className="aspect-video w-full">
                                                    {getYouTubeId(drama.trailerUrl) && (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${getYouTubeId(drama.trailerUrl)}?autoplay=1&rel=0`}
                                                            title={`${drama.title} OST`}
                                                            className="w-full h-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="container mx-auto px-4 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-16">
                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm mt-4 lg:-mt-12 relative z-20 shadow-2xl">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Episodes</span>
                                    <p className="text-xl font-bold text-white tracking-tight">{drama.episodes || '??'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Channel</span>
                                    <p className="text-xl font-bold text-white tracking-tight">{drama.channel || 'Hum TV'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Country</span>
                                    <p className="text-xl font-bold text-white tracking-tight">Pakistan</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Release</span>
                                    <p className="text-xl font-bold text-white tracking-tight">{drama.year}</p>
                                </div>
                            </div>

                            <div ref={tabsRef} className="scroll-mt-24">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 gap-8">
                                        <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-widest transition-all">
                                            Overview
                                        </TabsTrigger>
                                        <TabsTrigger value="episodes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-widest transition-all">
                                            Episodes
                                        </TabsTrigger>
                                        <TabsTrigger value="cast" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-widest transition-all">
                                            Cast & Staff
                                        </TabsTrigger>
                                        <TabsTrigger value="discussions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-lg font-bold rounded-none px-0 py-4 text-white/40 uppercase tracking-widest transition-all">
                                            Discussions
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="mt-12 space-y-8 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold border-l-4 border-primary pl-4">Synopsis</h3>
                                                <p className="text-white/80 leading-relaxed text-lg italic">
                                                    "{drama.synopsis || "Witness this compelling story of love, betrayal, and redemption. A masterpiece that has captivated audiences nationwide with its stellar performances and gripping narrative."}"
                                                </p>
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-bold border-l-4 border-primary pl-4">Quick Facts</h3>
                                                <div className="grid grid-cols-2 gap-6 bg-white/5 rounded-2xl p-6 border border-white/10">
                                                    <div className="space-y-1">
                                                        <span className="text-xs uppercase text-white/40 font-bold tracking-widest font-display">Airs On</span>
                                                        <p className="text-white font-medium flex items-center gap-2">
                                                            <Tv className="w-4 h-4 text-primary" />
                                                            {drama.channel || 'Hum TV'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs uppercase text-white/40 font-bold tracking-widest font-display">Release Year</span>
                                                        <p className="text-white font-medium flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-primary" />
                                                            {drama.year}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs uppercase text-white/40 font-bold tracking-widest font-display">Status</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${drama.status === 'airing' ? 'bg-primary animate-pulse' : 'bg-white/40'}`} />
                                                            <p className="text-white font-medium capitalize">{drama.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs uppercase text-white/40 font-bold tracking-widest font-display">Total Episodes</span>
                                                        <p className="text-white font-medium flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            {drama.episodes || '??'} Episodes
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="discussions" className="mt-12 animate-fade-in">
                                        <CommentThread dramaId={drama.id} />
                                    </TabsContent>

                                    <TabsContent value="episodes" className="mt-12 animate-fade-in">
                                        {episodes.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {episodes.slice(0, visibleEpisodes).map((ep, i) => (
                                                        <div
                                                            key={ep.id}
                                                            className="group/ep cursor-pointer bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all hover:translate-y-[-4px]"
                                                            onClick={() => {
                                                                setCurrentEpisode(ep);
                                                                setIsPlayerOpen(true);
                                                            }}
                                                        >
                                                            <div className="relative aspect-video bg-black">
                                                                <img
                                                                    src={ep.thumbnail_url || drama.image}
                                                                    alt={`Episode ${ep.episode_number}`}
                                                                    className="w-full h-full object-cover opacity-60 group-hover/ep:opacity-100 transition-opacity"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Play className="w-10 h-10 text-white fill-white opacity-0 group-hover/ep:opacity-100 transition-all scale-75 group-hover/ep:scale-100" />
                                                                </div>
                                                                {ep.duration && (
                                                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                        {ep.duration}m
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="p-4">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="font-bold text-white mb-1 group-hover/ep:text-primary transition-colors uppercase tracking-tight">
                                                                        Episode {ep.episode_number}
                                                                    </h4>
                                                                    {ep.release_date && (
                                                                        <span className="text-[10px] text-white/40">{ep.release_date}</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-white/40 line-clamp-2 italic">
                                                                    Watch {drama.title} Episode {ep.episode_number} online.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {visibleEpisodes < episodes.length && (
                                                    <div className="mt-12 flex justify-center">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setVisibleEpisodes(prev => prev + 12)}
                                                            className="border-primary/20 hover:border-primary text-white/60 hover:text-white px-12 py-6 rounded-2xl bg-white/5 backdrop-blur-xl transition-all font-bold uppercase tracking-widest text-sm"
                                                        >
                                                            Load More Episodes
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-white/40 italic">No episodes added yet. Check back soon!</p>
                                                <Button
                                                    variant="link"
                                                    className="mt-2 text-primary"
                                                    onClick={() => {
                                                        const searchQuery = encodeURIComponent(`${drama.title} Pakistani Drama Full Episode`);
                                                        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
                                                    }}
                                                >
                                                    Search on YouTube
                                                </Button>
                                            </div>
                                        )}

                                        {/* Episode Player Dialog */}
                                        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
                                            <DialogContent className="max-w-5xl p-0 bg-black border-white/10 overflow-hidden">
                                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {drama.title} - Episode {currentEpisode?.episode_number}
                                                    </h3>
                                                </div>
                                                <div className="aspect-video w-full">
                                                    {currentEpisode && getYouTubeId(currentEpisode.video_url) ? (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${getYouTubeId(currentEpisode.video_url)}?autoplay=1`}
                                                            title={`${drama.title} Episode ${currentEpisode.episode_number}`}
                                                            className="w-full h-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                                            Video format not supported or invalid URL
                                                        </div>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TabsContent>

                                    <TabsContent value="cast" className="mt-12 animate-fade-in">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {drama.cast?.map((name: string, i: number) => (
                                                <div key={i} className="space-y-2 text-center group/cast cursor-pointer">
                                                    <div className="relative aspect-square rounded-full overflow-hidden bg-white/5 border-2 border-transparent group-hover/cast:border-primary transition-all">
                                                        {actorIds[name] ? (
                                                            <Link to={`/actor/${actorIds[name]}`}>
                                                                <div className="w-full h-full flex items-center justify-center text-primary/40 font-black text-4xl bg-gradient-to-br from-white/10 to-transparent">
                                                                    {name.charAt(0)}
                                                                </div>
                                                            </Link>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-4xl">
                                                                {name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm lg:text-base group-hover/cast:text-primary transition-colors">{name}</h5>
                                                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Lead Actor</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-8">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ListFilter className="w-5 h-5 text-primary" />
                                    Categories
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {drama.genre?.map((g: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-primary hover:text-white transition-all py-1.5 px-3 cursor-pointer">
                                            {g}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/10 space-y-6">
                                    <h3 className="text-xl font-bold">Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40 font-medium">Native Title</span>
                                            <span className="text-white font-bold">{drama.title}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40 font-medium">Country</span>
                                            <span className="text-white font-bold uppercase tracking-widest">Pakistan</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40 font-medium">Episodes</span>
                                            <span className="text-white font-bold">{drama.episodes || '??'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40 font-medium">Rating</span>
                                            <span className="text-primary font-black text-lg">{(drama.siteRating && Number(drama.siteRating) > 0) ? drama.siteRating : drama.rating} / 10</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Promotional card */}
                            <div className="bg-gradient-to-br from-primary to-primary/60 rounded-2xl p-8 text-black space-y-4 relative overflow-hidden group/promo">
                                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/20 rounded-full blur-3xl transition-all group-hover/promo:scale-150" />
                                <h4 className="text-2xl font-black italic tracking-tighter">JOIN MERIDRAMALIST</h4>
                                <p className="text-sm font-bold opacity-80 leading-tight">Rate your favorite Pakistani dramas, track your progress, and join our growing community of fans!</p>
                                <Button
                                    className="w-full bg-black text-white hover:bg-black/80 font-bold border-none"
                                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Create Your List'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DramaDetail;
