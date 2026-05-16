import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import {
    Users, Search, UserPlus, Check, X, UserMinus,
    MessageSquare, Globe, User as UserIcon, Loader2,
    Star, PlayCircle, LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import socialService, { SocialFriend, FriendRequest } from '@/services/socialService';
import { useAuth } from '@/hooks/auth-context';

// Community Feed Imports
import { reviewService, UserReview } from '@/services/reviewService';
import { useDramaModal } from '@/hooks/use-drama-modal';
import { mapApiDramaToFrontend } from '@/services/dramaService';
import { ReviewCard } from '@/components/ReviewCard';

const CommunityFeed = () => {
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { openModal } = useDramaModal();

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            const data = await reviewService.getFeed();
            setReviews(data.reviews);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No activity yet. Be the first to post a review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <ReviewCard key={review.id} review={review} showDramaInfo={true} />
            ))}
        </div>
    );
};

const Social = () => {
    const { user, isAuthenticated } = useAuth();
    const [friends, setFriends] = useState<SocialFriend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<SocialFriend[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadSocialData();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const loadSocialData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                socialService.getFriends(),
                socialService.getPendingRequests()
            ]);
            setFriends(friendsData);
            setPendingRequests(requestsData);
        } catch (error) {
            toast.error('Failed to load social data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const results = await socialService.searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const sendRequest = async (userId: number) => {
        try {
            await socialService.sendFriendRequest(userId);
            toast.success('Friend request sent!');
            // Remove from search results to prevent double clicking
            setSearchResults(prev => prev.filter(u => u.id !== userId));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const acceptRequest = async (requestId: number) => {
        try {
            await socialService.acceptFriendRequest(requestId);
            toast.success('Friend request accepted!');
            loadSocialData();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const rejectRequest = async (requestId: number) => {
        try {
            await socialService.removeFriendship(requestId);
            toast.success('Request removed');
            loadSocialData();
        } catch (error) {
            toast.error('Failed to remove request');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <SEO
                title="Community"
                description="Connect with fellow Pakistani drama enthusiasts. Find friends, share your watchlist, and discuss your favorite dramas with the MeriDramaList community."
                keywords="Pakistani drama community, drama fans, drama discussions, watchlist sharing"
                url="/social"
            />
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Community</h1>
                        <p className="text-muted-foreground">Find friends and see what they are watching</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Login Prompt for non-authenticated users */}
                    {!isAuthenticated ? (
                        <div className="lg:col-span-3">
                            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                                        <LogIn className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold mb-3">Join the Community</h2>
                                    <p className="text-muted-foreground max-w-md mb-6">
                                        Sign in to find friends, see what they're watching, and share your drama journey with others!
                                    </p>
                                    <div className="flex gap-4">
                                        <Link to="/login">
                                            <Button variant="primary" size="lg" className="gap-2">
                                                <LogIn className="w-4 h-4" /> Sign In
                                            </Button>
                                        </Link>
                                        <Link to="/signup">
                                            <Button variant="outline" size="lg" className="gap-2">
                                                <UserPlus className="w-4 h-4" /> Create Account
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <>
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                <Tabs defaultValue="friends" className="w-full">
                                    <TabsList className="bg-secondary/50 mb-6">
                                        <TabsTrigger value="friends" className="gap-2">
                                            Friends <span className="text-xs bg-primary/20 px-1.5 rounded-full">{friends.length}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="search" className="gap-2">
                                            Find People
                                        </TabsTrigger>
                                        <TabsTrigger value="feed" className="gap-2">
                                            Global Feed
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="friends">
                                        {isLoading ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            </div>
                                        ) : friends.length === 0 ? (
                                            <Card className="bg-secondary/20 border-border">
                                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                    <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                                                    <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
                                                    <p className="text-muted-foreground mb-6">
                                                        Start by searching for users or inviting others to join!
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {friends.map(friend => (
                                                    <Card key={friend.id} className="bg-card hover:bg-secondary/20 transition-colors border-border">
                                                        <CardContent className="p-4 flex items-center gap-4">
                                                            <Avatar className="w-14 h-14 border-2 border-primary/20">
                                                                <AvatarImage src={friend.avatar} alt={friend.username} />
                                                                <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <Link to={`/user/${friend.username}`} className="font-bold text-lg hover:text-primary transition-colors block truncate">
                                                                    {friend.username}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">{friend.bio || 'No bio yet'}</p>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                                                <MessageSquare className="w-5 h-5" />
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="search">
                                        <div className="space-y-6">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search by username..."
                                                        className="pl-10 bg-secondary/30 border-none"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            setSearchQuery(e.target.value);
                                                            setHasSearched(false);
                                                        }}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                    />
                                                </div>
                                                <Button variant="primary" onClick={handleSearch} disabled={isSearching}>
                                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {searchResults.map(user => (
                                                    <Card key={user.id} className="bg-card border-border">
                                                        <CardContent className="p-4 flex items-center gap-4">
                                                            <Avatar className="w-12 h-12">
                                                                <AvatarImage src={user.avatar} alt={user.username} />
                                                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <Link to={`/user/${user.username}`} className="font-bold hover:text-primary transition-colors block truncate">
                                                                    {user.username}
                                                                </Link>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">{user.bio || 'No bio yet'}</p>
                                                            </div>
                                                            <Button
                                                                variant="gold"
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={() => sendRequest(user.id)}
                                                            >
                                                                <UserPlus className="w-4 h-4" /> Add
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {!isSearching && hasSearched && searchResults.length === 0 && (
                                                    <div className="col-span-full py-12 text-center text-muted-foreground">
                                                        No users found matching "{searchQuery}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="feed">
                                        <CommunityFeed />
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <Card className="bg-secondary/10 border-border overflow-hidden">
                                    <CardHeader className="bg-secondary/30 py-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <UserPlus className="w-5 h-5 text-primary" />
                                            Requests
                                        </CardTitle>
                                        <CardDescription>Pending friend requests</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        {pendingRequests.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
                                        ) : (
                                            pendingRequests.map(req => (
                                                <div key={req.id} className="flex items-center gap-3 bg-secondary/20 p-2 rounded-lg">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={req.requester.avatar} />
                                                        <AvatarFallback>{req.requester.username[0].toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate">{req.requester.username}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-emerald hover:bg-emerald/10"
                                                            onClick={() => acceptRequest(req.id)}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-red-500 hover:bg-red-500/10"
                                                            onClick={() => rejectRequest(req.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-primary/5 border-primary/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground space-y-3">
                                        <p>• Find friends to see their ratings and reviews.</p>
                                        <p>• Connect with people who share your drama taste.</p>
                                        <p>• You can browse public profiles even if you aren't friends yet!</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Social;
