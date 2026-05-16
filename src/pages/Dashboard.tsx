import { useState, useMemo, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    Play, Clock, CheckCircle2, PauseCircle, XCircle, Calendar,
    Star, TrendingUp, Film, Plus, Settings, Search, Loader2, ChevronDown,
    Share2, Copy, RefreshCw, Check, ExternalLink, FolderHeart, Globe, Lock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth-context';
import { useList } from '@/hooks/use-list';
import socialService, { UserList } from '@/services/socialService';
import { mapApiDramaToFrontend } from '@/services/dramaService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navbar from '@/components/Navbar';
import AddDramaModal from '@/components/AddDramaModal';
import RecommendationsSection from '@/components/RecommendationsSection';
import SEO from '@/components/SEO';
import myDramaListService, { ShareSettings } from '@/services/myDramaListService';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    </div>
);

const statusConfig = {
    watching: { label: 'Watching', icon: Play, color: 'text-blue-500' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald' },
    plan_to_watch: { label: 'Plan to Watch', icon: Calendar, color: 'text-accent' },
    on_hold: { label: 'On Hold', icon: PauseCircle, color: 'text-yellow-500' },
    dropped: { label: 'Dropped', icon: XCircle, color: 'text-red-500' },
};

const Dashboard = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { userDramas, userStats, isLoading: listLoading, refreshList, refreshStats, removeDramaEntry, updateDramaEntry } = useList();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dramaToDelete, setDramaToDelete] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [userLists, setUserLists] = useState<UserList[]>([]);
    const [isListsLoading, setIsListsLoading] = useState(false);
    const { toast } = useToast();

    // Share settings state
    const [shareSettings, setShareSettings] = useState<ShareSettings>({ share_token: null, share_enabled: false, share_url: null });
    const [shareLoading, setShareLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Load share settings and user lists on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const settings = await myDramaListService.getShareSettings();
                setShareSettings(settings);

                // Fetch user lists (Collections)
                setIsListsLoading(true);
                const lists = await socialService.getUserLists();
                setUserLists(lists);
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setIsListsLoading(false);
            }
        };
        if (isAuthenticated) {
            loadInitialData();
        }
    }, [isAuthenticated]);

    // Refresh data when modal closes
    useEffect(() => {
        if (!isModalOpen) {
            refreshList();
            refreshStats();
        }
    }, [isModalOpen]);

    // Use stats from API or calculate fallback
    const stats = useMemo(() => {
        if (userStats) {
            return {
                totalEntries: userStats.total,
                completed: userStats.completed,
                watching: userStats.watching,
                planToWatch: userStats.plan_to_watch,
                onHold: userStats.on_hold,
                dropped: userStats.dropped,
                meanScore: userStats.mean_score,
                daysWatched: userStats.days_watched.toFixed(1),
                totalEpisodes: userStats.total_episodes,
            };
        }

        // Fallback calculation if stats not loaded
        return {
            totalEntries: userDramas.length,
            completed: userDramas.filter(d => d.status === 'completed').length,
            watching: userDramas.filter(d => d.status === 'watching').length,
            planToWatch: userDramas.filter(d => d.status === 'plan_to_watch').length,
            onHold: userDramas.filter(d => d.status === 'on_hold').length,
            dropped: userDramas.filter(d => d.status === 'dropped').length,
            meanScore: '0.0',
            daysWatched: '0.0',
            totalEpisodes: 0,
        };
    }, [userStats, userDramas]);

    // Share functions
    const handleToggleSharing = async (enabled: boolean) => {
        setShareLoading(true);
        try {
            const settings = await myDramaListService.toggleSharing(enabled);
            setShareSettings(settings);
            toast({
                title: enabled ? 'Sharing enabled!' : 'Sharing disabled',
                description: enabled ? 'Your drama list is now public.' : 'Your drama list is now private.',
            });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update sharing settings', variant: 'destructive' });
        } finally {
            setShareLoading(false);
        }
    };

    const handleGenerateLink = async () => {
        setShareLoading(true);
        try {
            const settings = await myDramaListService.generateShareLink();
            setShareSettings(settings);
            toast({ title: 'New link generated!', description: 'Your share link has been updated.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to generate share link', variant: 'destructive' });
        } finally {
            setShareLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (shareSettings.share_url) {
            await navigator.clipboard.writeText(shareSettings.share_url);
            setCopied(true);
            toast({ title: 'Link copied!', description: 'Share link copied to clipboard.' });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Filter dramas based on active tab and search
    const filteredDramas = useMemo(() => {
        let filtered = userDramas;

        if (activeTab !== 'all') {
            filtered = filtered.filter(d => d.status === activeTab);
        }

        if (searchQuery) {
            filtered = filtered.filter(d => {
                return d.drama?.title?.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        return filtered;
    }, [userDramas, activeTab, searchQuery]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <SEO
                title="My Dashboard"
                description="Track your watched Pakistani dramas, manage your watchlist, and discover new shows."
                url="/dashboard"
                noindex={true}
            />

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto px-4 pt-24 pb-12">
                    {/* User Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20 border-2 border-accent">
                                <AvatarImage src={user?.avatar} alt={user?.username} />
                                <AvatarFallback className="text-2xl">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-foreground">{user?.username}'s Dashboard</h1>
                                <p className="text-muted-foreground">
                                    Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="gold" className="gap-2" onClick={() => setIsModalOpen(true)}>
                                <Plus className="w-4 h-4" />
                                Add Drama
                            </Button>
                            <Link to="/profile">
                                <Button variant="outline" className="gap-2">
                                    <Settings className="w-4 h-4" />
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={<Film className="w-6 h-6 text-white" />}
                            label="Total Entries"
                            value={stats.totalEntries}
                            color="bg-primary"
                        />
                        <StatCard
                            icon={<Star className="w-6 h-6 text-white" />}
                            label="Mean Score"
                            value={stats.meanScore}
                            color="bg-accent"
                        />
                        <StatCard
                            icon={<Clock className="w-6 h-6 text-white" />}
                            label="Days Watched"
                            value={stats.daysWatched}
                            color="bg-emerald"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-6 h-6 text-white" />}
                            label="Episodes"
                            value={stats.totalEpisodes}
                            color="bg-blue-500"
                        />
                    </div>

                    {/* Share My List Section */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Share My Drama List</h2>
                                    <p className="text-sm text-muted-foreground">Let others see what you're watching</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{shareSettings.share_enabled ? 'Public' : 'Private'}</span>
                                <Switch
                                    checked={shareSettings.share_enabled}
                                    onCheckedChange={handleToggleSharing}
                                    disabled={shareLoading}
                                />
                            </div>
                        </div>

                        {shareSettings.share_enabled && shareSettings.share_url && (
                            <div className="mt-4 p-4 bg-background/50 rounded-lg">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-2">
                                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm text-foreground truncate">{shareSettings.share_url}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleCopyLink}
                                            disabled={shareLoading}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleGenerateLink}
                                            disabled={shareLoading}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${shareLoading ? 'animate-spin' : ''}`} />
                                            New Link
                                        </Button>
                                        <a
                                            href={shareSettings.share_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="gold" size="sm" className="gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                Preview
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!shareSettings.share_token && (
                            <div className="mt-4">
                                <Button
                                    variant="gold"
                                    className="gap-2"
                                    onClick={handleGenerateLink}
                                    disabled={shareLoading}
                                >
                                    {shareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                    Generate Share Link
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Personalized Recommendations */}
                    <div className="mb-8">
                        <RecommendationsSection />
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Drama Status</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(statusConfig).map(([key, config]) => {
                                const count = stats[key === 'plan_to_watch' ? 'planToWatch' : key as keyof typeof stats] || 0;
                                return (
                                    <div
                                        key={key}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                                        onClick={() => setActiveTab(key)}
                                    >
                                        <config.icon className={`w-5 h-5 ${config.color}`} />
                                        <div>
                                            <p className="text-xl font-bold text-foreground">{count as number}</p>
                                            <p className="text-xs text-muted-foreground">{config.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Drama List */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-semibold text-foreground">My Drama List</h2>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search dramas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-secondary/30 border-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4 bg-secondary/50">
                                <TabsTrigger value="all">All ({userDramas.length})</TabsTrigger>
                                <TabsTrigger value="watching">Watching ({stats.watching})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                                <TabsTrigger value="plan_to_watch">Plan to Watch ({stats.planToWatch})</TabsTrigger>
                                <TabsTrigger value="collections" className="gap-2">
                                    Collections <Badge variant="secondary" className="px-1.5 h-4 text-[10px]">{userLists.length}</Badge>
                                </TabsTrigger>
                            </TabsList>

                            {/* Individual Tab Contents for standard statuses */}
                            {['all', 'watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'].map((tab) => (
                                <TabsContent key={tab} value={tab} className="mt-0">
                                    {listLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredDramas.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">No dramas found</p>
                                            <Button variant="gold" className="mt-4" onClick={() => setIsModalOpen(true)}>
                                                Add Your First Drama
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredDramas.map((entry) => {
                                                const drama = entry.drama ? mapApiDramaToFrontend(entry.drama) : null;
                                                if (!drama) return null;
                                                const config = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig.watching;

                                                return (
                                                    <div
                                                        key={entry.drama_id}
                                                        className="group flex items-center gap-4 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                                    >
                                                        <img
                                                            src={drama.image}
                                                            alt={drama.title}
                                                            className="w-12 h-16 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground truncate">{drama.title}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <span>{drama.channel}</span>
                                                                <span>•</span>
                                                                <span>{drama.year}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {entry.user_rating && (
                                                                <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
                                                                    <Star className="w-4 h-4 text-accent fill-accent" />
                                                                    <span className="text-sm font-medium text-accent">{entry.user_rating}</span>
                                                                </div>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Badge className={`${config.color} bg-secondary cursor-pointer hover:opacity-80`}>
                                                                        <config.icon className="w-3 h-3 mr-1" />
                                                                        {config.label}
                                                                        <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                                                                    </Badge>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {Object.entries(statusConfig).map(([key, conf]) => (
                                                                        <DropdownMenuItem
                                                                            key={key}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                updateDramaEntry(drama.id, { status: key as any });
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <conf.icon className={`w-4 h-4 mr-2 ${conf.color}`} />
                                                                            {conf.label}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>

                                                            {/* Remove Action */}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDramaToDelete(drama);
                                                                }}
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}

                            {/* Specialized Content for Collections Tab */}
                            <TabsContent value="collections" className="mt-0">
                                {isListsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : userLists.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                                            <FolderHeart className="w-10 h-10 text-muted-foreground/40" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">No collections yet</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                                            Create custom lists to organize your favorite dramas by genre, mood, or year!
                                        </p>
                                        <Button variant="gold" className="gap-2 h-12 px-8">
                                            <Plus className="w-5 h-5" /> Create New Collection
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Personal Collections</h3>
                                            <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/10">
                                                <Plus className="w-4 h-4" /> New List
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {userLists.map(list => (
                                                <Link key={list.id} to={`/lists/${list.id}`} className="block group">
                                                    <div className="relative bg-secondary/10 hover:bg-secondary/20 border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5">
                                                        <div className="p-6">
                                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center text-primary group-hover:from-primary group-hover:to-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/10">
                                                                        <FolderHeart className="w-7 h-7" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{list.name}</h3>
                                                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                                            <span className="font-semibold text-foreground/70">{list.dramas?.length || 0}</span> items
                                                                            <span className="opacity-30">•</span>
                                                                            {list.is_public ? (
                                                                                <span className="flex items-center gap-1 text-[11px] bg-emerald/10 text-emerald px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                                                                    <Globe className="w-3 h-3" /> Public
                                                                                </span>
                                                                            ) : (
                                                                                <span className="flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                                                                    <Lock className="w-3 h-3" /> Private
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white p-2 rounded-full">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 min-h-[2.5rem] italic">
                                                                "{list.description || 'No description provided for this collection.'}"
                                                            </p>

                                                            {/* Drama Thumbnails Preview */}
                                                            <div className="flex items-center -space-x-3 overflow-hidden">
                                                                {list.dramas?.slice(0, 5).map((drama, i) => (
                                                                    <div key={drama.id} className="relative w-10 h-14 rounded-md border-2 border-background overflow-hidden shadow-md transform hover:-translate-y-1 transition-transform" style={{ zIndex: 10 - i }}>
                                                                        <img src={drama.image_url} alt="" className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                                {(list.dramas?.length || 0) > 5 && (
                                                                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground relative z-0">
                                                                        +{list.dramas!.length - 5}
                                                                    </div>
                                                                )}
                                                                {(!list.dramas || list.dramas.length === 0) && (
                                                                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Empty Collection</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Bottom Accent Bar */}
                                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            <AddDramaModal open={isModalOpen} onOpenChange={setIsModalOpen} />

            <AlertDialog open={!!dramaToDelete} onOpenChange={(open) => !open && setDramaToDelete(null)}>
                <AlertDialogContent className="bg-card border-border text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove from Watchlist?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to remove <span className="font-bold text-foreground">{dramaToDelete?.title}</span> from your list?
                            This action cannot be undone and you will lose your progress tracking for this title.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={async () => {
                                if (dramaToDelete) {
                                    await removeDramaEntry(dramaToDelete.id);
                                    setDramaToDelete(null);
                                }
                            }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default Dashboard;
