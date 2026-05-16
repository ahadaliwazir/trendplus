import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
    Calendar, Film, Star, Clock, Play, CheckCircle2,
    PauseCircle, XCircle, ChevronRight, Loader2, User as UserIcon,
    AlertCircle, UserPlus, UserMinus, Users, MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import socialService, { UserProfile, SocialFriend } from '@/services/socialService';
import { mapApiDramaToFrontend } from '@/services/dramaService';
import { useAuth } from '@/hooks/auth-context';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { reviewService, UserReview } from '@/services/reviewService';
import { ReviewCard } from '@/components/ReviewCard';

const statusConfig = {
    watching: { label: 'Watching', icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald', bg: 'bg-emerald/10' },
    plan_to_watch: { label: 'Plan to Watch', icon: Calendar, color: 'text-accent', bg: 'bg-accent/10' },
    on_hold: { label: 'On Hold', icon: PauseCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    dropped: { label: 'Dropped', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const UserProfilePage = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const { openModal } = useDramaModal();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [dramaList, setDramaList] = useState<any[]>([]);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [activeSection, setActiveSection] = useState('dramalist');
    const [isFriend, setIsFriend] = useState(false);
    const [friendshipId, setFriendshipId] = useState<number | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        if (username) {
            loadProfile();
            loadUserReviews();
            checkFriendshipStatus();
        }
    }, [username, currentUser]);

    const loadUserReviews = async () => {
        try {
            const userReviews = await reviewService.getUserReviews(username!);
            setReviews(userReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await socialService.getUserProfile(username!);
            setProfile(data.user);
            setDramaList(data.dramaList);
            // Check if this is the current user's own profile
            if (currentUser && currentUser.username === username) {
                setIsOwnProfile(true);
            }
        } catch (error) {
            toast.error('User not found');
        } finally {
            setIsLoading(false);
        }
    };

    const checkFriendshipStatus = async () => {
        if (!currentUser) return;
        try {
            const friends = await socialService.getFriends();
            const friend = friends.find(f => f.username === username);
            if (friend) {
                setIsFriend(true);
            }
        } catch (error) {
            console.error('Error checking friendship status:', error);
        }
    };

    const handleAddFriend = async () => {
        if (!profile) return;
        try {
            await socialService.sendFriendRequest(profile.id);
            toast.success('Friend request sent!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleRemoveFriend = async () => {
        // For now, just show a message - we'd need the friendshipId from the friends list
        toast.info('Use the Community page to manage friends');
    };

    const stats = {
        total: dramaList.length,
        completed: dramaList.filter(d => d.status === 'completed').length,
        watching: dramaList.filter(d => d.status === 'watching').length,
        meanScore: dramaList.length ? (dramaList.reduce((acc, curr) => acc + (curr.user_rating || 0), 0) / dramaList.filter(d => d.user_rating).length || 0).toFixed(1) : '0.0'
    };

    const filteredDramas = activeTab === 'all'
        ? dramaList
        : dramaList.filter(d => d.status === activeTab);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Navbar />
                <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                <p className="text-muted-foreground mb-6">The user you are looking for does not exist.</p>
                <Link to="/">
                    <Button variant="primary">GO Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <SEO
                title={`${profile.username}'s Profile`}
                description={`View ${profile.username}'s drama list on MeriDramaList. See what Pakistani dramas they're watching, their ratings, and reviews.`}
                url={`/user/${profile.username}`}
            />
            <Navbar />

            {/* Profile Header */}
            <div className="relative pt-32 pb-12 bg-gradient-to-b from-primary/10 to-transparent border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                            <AvatarImage src={profile.avatar} alt={profile.username} />
                            <AvatarFallback className="text-4xl">{profile.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <h1 className="text-4xl font-display font-bold">{profile.username}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <Badge variant="secondary" className="px-3 py-1">Member</Badge>
                                </div>
                            </div>
                            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
                                {profile.bio || "No bio description provided yet."}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Film className="w-4 h-4" />
                                    {stats.total} Dramas
                                </div>
                                <div className="flex items-center gap-2 text-accent">
                                    <Star className="w-4 h-4 fill-accent" />
                                    {stats.meanScore} Mean Score
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Stats Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-card border-border overflow-hidden">
                            <div className="p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                                    <CheckCircle2 className="w-5 h-5 text-emerald" />
                                    Statistics
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Completed</span>
                                        <span className="font-bold">{stats.completed}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Watching</span>
                                        <span className="font-bold">{stats.watching}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total List</span>
                                        <span className="font-bold">{stats.total}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Content - Drama List & Reviews */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <Button
                                    variant={activeSection === 'dramalist' ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setActiveSection('dramalist')}
                                >
                                    <Film className="w-4 h-4" /> Drama List
                                </Button>
                                <Button
                                    variant={activeSection === 'reviews' ? 'primary' : 'secondary'}
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setActiveSection('reviews')}
                                >
                                    <MessageSquare className="w-4 h-4" /> Reviews ({reviews.length})
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {!isOwnProfile && currentUser && (
                                    isFriend ? (
                                        <Button variant="secondary" size="sm" className="gap-2" disabled>
                                            <Users className="w-4 h-4" /> Friends
                                        </Button>
                                    ) : (
                                        <Button variant="primary" size="sm" className="gap-2" onClick={handleAddFriend}>
                                            <UserPlus className="w-4 h-4" /> Add Friend
                                        </Button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Drama List Section */}
                        {activeSection === 'dramalist' && (
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="bg-secondary/50 mb-6 flex-wrap h-auto gap-2">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <TabsTrigger key={key} value={key} className="gap-2">
                                            <config.icon className="w-3.5 h-3.5" />
                                            {config.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <TabsContent value={activeTab} className="mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredDramas.map(entry => {
                                            const drama = mapApiDramaToFrontend(entry.drama);
                                            const config = statusConfig[entry.status as keyof typeof statusConfig];
                                            return (
                                                <Card
                                                    key={entry.id}
                                                    className="bg-card hover:bg-secondary/40 transition-colors border-border overflow-hidden group cursor-pointer"
                                                    onClick={() => openModal(drama)}
                                                >                                                <CardContent className="p-0 flex h-32">
                                                        <img
                                                            src={drama.image}
                                                            alt={drama.title}
                                                            className="w-24 h-full object-cover"
                                                        />
                                                        <div className="flex-1 p-4 flex flex-col">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-lg leading-tight line-clamp-1">{drama.title}</h4>
                                                                {entry.user_rating && (
                                                                    <div className="flex items-center gap-1 text-accent font-bold">
                                                                        <Star className="w-4 h-4 fill-accent" />
                                                                        {entry.user_rating}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-auto">{drama.channel} • {drama.year}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`${config.color} ${config.bg} border-none font-medium`}>
                                                                    <config.icon className="w-3 h-3 mr-1" />
                                                                    {config.label}
                                                                </Badge>
                                                                {entry.episodes_watched > 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Ep {entry.episodes_watched}/{drama.episodes || '?'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                        {filteredDramas.length === 0 && (
                                            <div className="col-span-full py-20 text-center bg-secondary/10 rounded-xl border border-dashed border-border">
                                                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <p className="text-muted-foreground">No dramas in this category</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}

                        {/* Reviews Section */}
                        {activeSection === 'reviews' && (
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="py-20 text-center bg-secondary/10 rounded-xl border border-dashed border-border">
                                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No reviews written yet</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <ReviewCard key={review.id} review={review} showDramaInfo={true} />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;
