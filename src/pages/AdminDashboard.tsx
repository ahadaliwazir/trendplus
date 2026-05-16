import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import {
    Users, Film, MessageSquare, BarChart3, Plus, Search,
    Edit, Trash2, Shield, User as UserIcon,
    Loader2, CheckCircle2, Star, Calendar, Tv, Newspaper, AlertTriangle, Ban, RefreshCw, Clock,
    UserRound, UserCheck, AlignVerticalJustifyCenter, ScanFace,
    PlayCircle
} from 'lucide-react';
import { ActorAutocomplete } from '@/components/ActorAutocomplete';
import { AdminEpisodeModal } from '@/components/AdminEpisodeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from '@/hooks/auth-context';
import { adminService, AdminStats } from '@/services/adminService';
import { dramaService, DramaFromApi } from '@/services/dramaService';
import { User as UserType } from '@/services/authService';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import AdminDramaModal from '@/components/AdminDramaModal';
import AdminActorModal from '@/components/AdminActorModal';
import AdminNewsModal from '@/components/AdminNewsModal';
import { newsService, News } from '@/services/newsService';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [dramas, setDramas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');


    // Modal states
    const [isDramaModalOpen, setIsDramaModalOpen] = useState(false);
    const [selectedDrama, setSelectedDrama] = useState<any>(null);
    const [isActorModalOpen, setIsActorModalOpen] = useState(false);
    const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
    const [selectedEpisodeDrama, setSelectedEpisodeDrama] = useState<any>(null);
    const [selectedActor, setSelectedActor] = useState<any>(null);
    const [actors, setActors] = useState<any[]>([]);
    const [actorsLoading, setActorsLoading] = useState(false);
    const [actorSearchTerm, setActorSearchTerm] = useState('');

    // Featured rankings state
    const [featuredDramas, setFeaturedDramas] = useState<any[]>([]);
    const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [dramaToDelete, setDramaToDelete] = useState<{ id: number; title: string } | null>(null);

    // News state
    const [newsItems, setNewsItems] = useState<News[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);

    // Moderation state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [suspendedUsers, setSuspendedUsers] = useState<any[]>([]);
    const [moderationLoading, setModerationLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            fetchStatsAndUsers();
        }
    }, [isAuthenticated, user]);

    // Handle debounced search for dramas and actors
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') return;

        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'dramas' || activeTab === 'overview') {
                fetchDramas();
            } else if (activeTab === 'actors') {
                fetchActors();
            } else if (activeTab === 'users') {
                fetchStatsAndUsers(); // Re-fetch users with search term
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, actorSearchTerm, userSearchTerm, statusFilter, activeTab, isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin' && activeTab === 'featured') {
            fetchFeaturedDramas();
        }
    }, [activeTab, isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin' && activeTab === 'news') {
            fetchNews();
        }
    }, [activeTab, isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin' && activeTab === 'moderation') {
            fetchModeration();
        }
    }, [activeTab, isAuthenticated, user]);

    const fetchModeration = async () => {
        setModerationLoading(true);
        try {
            const [notifResponse, blockedResponse, suspendedResponse] = await Promise.all([
                api.get<any>('/admin/notifications'),
                api.get<any>('/admin/blocked-users'),
                api.get<any>('/admin/suspended-users')
            ]);
            setNotifications(notifResponse.data?.notifications || []);
            setUnreadCount(notifResponse.data?.unread_count || 0);
            setBlockedUsers(blockedResponse.data?.users || []);
            setSuspendedUsers(suspendedResponse.data?.users || []);
        } catch (error) {
            console.error('Error fetching moderation data:', error);
        } finally {
            setModerationLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.put(`/admin/notifications/${id}/read`, {});
            fetchModeration();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/admin/notifications/read-all', {});
            toast.success('All notifications marked as read');
            fetchModeration();
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleUnblockUser = async (id: number) => {
        try {
            await api.put(`/admin/users/${id}/unblock`, {});
            toast.success('User unblocked');
            fetchModeration();
        } catch (error) {
            toast.error('Failed to unblock user');
        }
    };

    const handleUnsuspendUser = async (id: number) => {
        try {
            await api.put(`/admin/users/${id}/unsuspend`, {});
            toast.success('User unsuspended');
            fetchModeration();
        } catch (error) {
            toast.error('Failed to unsuspend user');
        }
    };

    const fetchNews = async () => {
        setNewsLoading(true);
        try {
            const data = await newsService.getAll({ limit: 50 });
            setNewsItems(data?.news || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setNewsLoading(false);
        }
    };

    const fetchFeaturedDramas = async () => {
        setIsFeaturedLoading(true);
        try {
            const result = await dramaService.getFeaturedAiring();
            setFeaturedDramas(result);
        } catch (error) {
            toast.error('Failed to fetch featured dramas');
        } finally {
            setIsFeaturedLoading(false);
        }
    };

    const handleUpdateFeaturedRank = async (dramaId: number, rank: number | null) => {
        try {
            await adminService.updateFeaturedRank(dramaId, rank);
            toast.success(rank ? `Ranked #${rank}` : 'Ranking removed');
            if (activeTab === 'featured') fetchFeaturedDramas();
            fetchDramas(); // Refresh drama list to show new ranks
        } catch (error) {
            toast.error('Failed to update ranking');
        }
    };

    const fetchStatsAndUsers = async () => {
        try {
            const [statsData, usersData] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers(1, 20, userSearchTerm)
            ]);
            setStats(statsData);
            setUsers(usersData.users);
        } catch (error) {
            toast.error('Failed to fetch stats/users');
        }
    };

    const fetchDramas = async () => {
        setIsLoading(true);
        try {
            const dramaData = await dramaService.getAll({
                limit: 100,
                search: searchTerm,
                status: (statusFilter && statusFilter !== 'all') ? statusFilter : undefined
            });
            // Sort dramas: ranked first (by rank ascending), then unranked
            const sortedDramas = (dramaData.dramas || []).sort((a: any, b: any) => {
                // If both have ranks, sort by rank ascending
                if (a.feature_rank && b.feature_rank) {
                    return a.feature_rank - b.feature_rank;
                }
                // Ranked dramas come before unranked
                if (a.feature_rank && !b.feature_rank) return -1;
                if (!a.feature_rank && b.feature_rank) return 1;
                // Both unranked - keep original order
                return 0;
            });
            setDramas(sortedDramas);
        } catch (error) {
            toast.error('Failed to fetch dramas');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActors = async () => {
        setActorsLoading(true);
        try {
            const response = await api.get<{ actors: any[]; pagination: any }>(
                `/actors?search=${actorSearchTerm}&limit=100`
            );
            setActors(response.data?.actors || []);
        } catch (error) {
            toast.error('Failed to fetch actors');
        } finally {
            setActorsLoading(false);
        }
    };

    const fetchData = () => {
        fetchStatsAndUsers();
        fetchDramas();
        fetchActors();
    };

    const handleEditDrama = (drama: any) => {
        setSelectedDrama(drama);
        setIsDramaModalOpen(true);
    };

    // Show delete confirmation dialog
    const handleDeleteDrama = (drama: any) => {
        setDramaToDelete({ id: drama.id, title: drama.title });
        setDeleteDialogOpen(true);
    };

    // Actually perform the deletion after confirmation
    const confirmDeleteDrama = async () => {
        if (!dramaToDelete) return;
        try {
            await adminService.deleteDrama(dramaToDelete.id);
            toast.success('Drama deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete drama');
        } finally {
            setDeleteDialogOpen(false);
            setDramaToDelete(null);
        }
    };

    const handleEditActor = (actor: any) => {
        setSelectedActor(actor);
        setIsActorModalOpen(true);
    };

    const handleDeleteActor = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this actor?')) return;
        try {
            await adminService.deleteActor(id);
            toast.success('Actor deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete actor');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminService.deleteUser(id);
            toast.success('User deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (authLoading) return null;
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Helmet>
                <title>Admin Panel - MeriDramaList</title>
            </Helmet>

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto px-4 pt-24 pb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Admin Panel</h1>
                            <p className="text-muted-foreground">Manage users, dramas, and site statistics</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 border-accent text-accent hover:bg-accent/10"
                                onClick={async () => {
                                    const loadingToast = toast.loading('Synchronizing episodes from YouTube...');
                                    try {
                                        const response = await adminService.syncYouTubeEpisodes();
                                        toast.success(response.data.message, { id: loadingToast });
                                    } catch (error) {
                                        toast.error('Failed to start synchronization', { id: loadingToast });
                                    }
                                }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sync YouTube
                            </Button>
                            <Button variant="gold" className="gap-2" onClick={() => {
                                setSelectedDrama(null);
                                setIsDramaModalOpen(true);
                            }}>
                                <Plus className="w-4 h-4" />
                                Add New Drama
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Film className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Dramas</p>
                                    <p className="text-2xl font-bold text-foreground">{stats?.totalDramas || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald/10 flex items-center justify-center">
                                    <MessageSquare className="w-6 h-6 text-emerald" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                                    <p className="text-2xl font-bold text-foreground">{stats?.totalReviews || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                                    <p className="text-2xl font-bold text-foreground">--</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6 bg-secondary/50">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="users">User Management</TabsTrigger>
                            <TabsTrigger value="dramas">Drama Management</TabsTrigger>
                            <TabsTrigger value="actors">Actor Management</TabsTrigger>
                            <TabsTrigger value="news">News Management</TabsTrigger>
                            <TabsTrigger value="moderation" className="gap-2">
                                Moderation
                                {unreadCount > 0 && (
                                    <Badge className="bg-destructive text-destructive-foreground h-5 px-1.5">{unreadCount}</Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="featured">Featured Rankings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Recent Users */}
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h3 className="text-lg font-semibold mb-4">Recent Registrations</h3>
                                    <div className="space-y-4">
                                        {stats?.recentUsers.map((u) => (
                                            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                                        <UserIcon className="w-5 h-5 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{u.username}</p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(u.created_at || '').toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="link" className="w-full mt-4 text-accent" onClick={() => setActiveTab('users')}>
                                        View All Users
                                    </Button>
                                </div>

                                {/* System Health */}
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h3 className="text-lg font-semibold mb-4">System Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald" />
                                                <span>API Server</span>
                                            </div>
                                            <Badge variant="outline" className="text-emerald border-emerald">Operational</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald/5">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald" />
                                                <span>Database</span>
                                            </div>
                                            <Badge variant="outline" className="text-emerald border-emerald">Connected</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="users">
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users by username or email..."
                                        className="pl-10 bg-card border-border"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/20 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            ) : users.map((u) => (
                                                <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold">{u.username.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium truncate">{u.username}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                            {u.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteUser(u.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="dramas">
                            <div className="mb-6 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search dramas by title..."
                                        className="pl-10 bg-card border-border"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="bg-card border-border">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="airing">Airing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/20 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-4">Drama</th>
                                                <th className="px-6 py-4">Channel</th>
                                                <th className="px-6 py-4">Details</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                                                    </td>
                                                </tr>
                                            ) : dramas.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                        No dramas found.
                                                    </td>
                                                </tr>
                                            ) : dramas.map((d) => (
                                                <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={d.image_url} alt={d.title} className="w-10 h-14 object-cover rounded shadow" />
                                                            <div className="min-w-0">
                                                                <p className="font-medium truncate">{d.title}</p>
                                                                <div className="flex items-center gap-1 text-xs text-accent">
                                                                    <Star className="w-3 h-3 fill-accent" />
                                                                    {d.imdb_rating}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                                        {d.channel || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {d.year}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Tv className="w-3 h-3" /> {d.episodes} eps
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`capitalize ${d.status === 'airing' ? 'text-blue-500 border-blue-500' :
                                                            d.status === 'completed' ? 'text-emerald border-emerald' :
                                                                'text-yellow-500 border-yellow-500'
                                                            }`}>
                                                            {d.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            {d.status === 'airing' && (
                                                                <Select
                                                                    value={d.feature_rank?.toString() || 'none'}
                                                                    onValueChange={(v: string) => handleUpdateFeaturedRank(d.id, v === 'none' ? null : parseInt(v))}
                                                                >
                                                                    <SelectTrigger className="w-[90px] h-8 text-[10px] bg-secondary/50">
                                                                        <SelectValue placeholder="Rank" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">No Rank</SelectItem>
                                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                                                            <SelectItem key={r} value={r.toString()}>Rank #{r}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                            <Button
                                                                variant="default"
                                                                size="icon"
                                                                className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white"
                                                                onClick={() => {
                                                                    setSelectedEpisodeDrama(d);
                                                                    setIsEpisodeModalOpen(true);
                                                                }}
                                                                title="Manage Episodes"
                                                            >
                                                                <PlayCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent" onClick={() => handleEditDrama(d)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteDrama(d)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="actors">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search actors by name..."
                                        className="pl-10 bg-card border-border"
                                        value={actorSearchTerm}
                                        onChange={(e) => setActorSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/20 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-4">Actor</th>
                                                <th className="px-6 py-4">Bio</th>
                                                <th className="px-6 py-4">Birth Details</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {actorsLoading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                                                    </td>
                                                </tr>
                                            ) : actors.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                        No actors found.
                                                    </td>
                                                </tr>
                                            ) : actors.map((a) => (
                                                <tr key={a.id} className="hover:bg-secondary/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {a.image_url ? (
                                                                <img src={a.image_url} alt={a.name} className="w-10 h-10 object-cover rounded-full shadow" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                                    <span className="text-xs font-bold">{a.name.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="font-medium truncate">{a.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-md">
                                                        <p className="line-clamp-2">{a.bio || 'No biography available.'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {a.birth_date || 'N/A'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                                {a.birth_place || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent" onClick={() => handleEditActor(a)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteActor(a.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="featured">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-semibold mb-4">Top 10 Airing Today</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Manage the featured dramas shown on the homepage. Only airing dramas can be featured.
                                </p>

                                {isFeaturedLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : featuredDramas.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No featured dramas yet.</p>
                                        <p className="text-sm mt-2">Go to Drama Management and set rankings for airing dramas.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                        {featuredDramas.map((drama) => (
                                            <div key={drama.id} className="relative bg-secondary/20 rounded-lg overflow-hidden group">
                                                <div className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {drama.feature_rank}
                                                </div>
                                                <img
                                                    src={drama.image_url || '/placeholder.jpg'}
                                                    alt={drama.title}
                                                    className="w-full aspect-[2/3] object-cover"
                                                />
                                                <div className="p-3">
                                                    <p className="font-medium text-sm truncate">{drama.title}</p>
                                                    <p className="text-xs text-muted-foreground">{drama.channel || 'N/A'}</p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                                                    onClick={() => handleUpdateFeaturedRank(drama.id, null)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* News Management Tab */}
                        <TabsContent value="news">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Newspaper className="w-5 h-5 text-accent" />
                                        News Articles
                                    </h3>
                                    <Button
                                        variant="gold"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => {
                                            setSelectedNews(null);
                                            setIsNewsModalOpen(true);
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Article
                                    </Button>
                                </div>

                                {newsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                    </div>
                                ) : newsItems.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No news articles yet. Click "Add Article" to create one.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {newsItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    {item.image_url && (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.title}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium truncate">{item.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.category.replace('_', ' ')}
                                                            </Badge>
                                                            {item.is_featured && (
                                                                <Badge className="bg-accent text-accent-foreground text-xs">
                                                                    Featured
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-muted-foreground">
                                                                {item.views} views
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedNews(item);
                                                            setIsNewsModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this article?')) {
                                                                await newsService.delete(item.id);
                                                                toast.success('Article deleted');
                                                                fetchNews();
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Moderation Tab */}
                        <TabsContent value="moderation">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Notifications */}
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                            Moderation Alerts
                                            {unreadCount > 0 && (
                                                <Badge className="bg-destructive">{unreadCount} new</Badge>
                                            )}
                                        </h3>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>

                                    {moderationLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            No moderation alerts
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {notifications.map((notif: any) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 rounded-lg border ${notif.is_read ? 'bg-secondary/10 border-border' : 'bg-yellow-500/10 border-yellow-500/30'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {notif.type === 'user_blocked' ? (
                                                                    <Ban className="w-4 h-4 text-destructive" />
                                                                ) : (
                                                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                                )}
                                                                <span className="font-medium text-sm">
                                                                    {notif.user?.username || 'Unknown User'}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {notif.type.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {new Date(notif.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleMarkAsRead(notif.id)}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Blocked Users */}
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <Ban className="w-5 h-5 text-destructive" />
                                        Blocked Users
                                        <Badge variant="outline">{blockedUsers.length}</Badge>
                                    </h3>

                                    {moderationLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                        </div>
                                    ) : blockedUsers.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            No blocked users
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {blockedUsers.map((user: any) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                                                            <UserIcon className="w-5 h-5 text-destructive" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.username}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="destructive">
                                                            {user.warning_count} warnings
                                                        </Badge>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUnblockUser(user.id)}
                                                        >
                                                            <RefreshCw className="w-4 h-4 mr-1" />
                                                            Unblock
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Suspended Users (Temporary Bans) */}
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <Clock className="w-5 h-5 text-yellow-500" />
                                        Suspended Users
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">{suspendedUsers.length}</Badge>
                                    </h3>

                                    {moderationLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-accent" />
                                        </div>
                                    ) : suspendedUsers.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            No suspended users
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {suspendedUsers.map((user: any) => {
                                                const daysLeft = Math.ceil((new Date(user.banned_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                                <UserIcon className="w-5 h-5 text-yellow-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{user.username}</p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                                                                {daysLeft} day(s) left
                                                            </Badge>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleUnsuspendUser(user.id)}
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                                Unsuspend
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            <AdminDramaModal
                open={isDramaModalOpen}
                onOpenChange={setIsDramaModalOpen}
                drama={selectedDrama}
                onSuccess={fetchDramas}
            />

            <AdminEpisodeModal
                open={isEpisodeModalOpen}
                onOpenChange={setIsEpisodeModalOpen}
                drama={selectedEpisodeDrama}
            />

            <AdminActorModal
                open={isActorModalOpen}
                onOpenChange={setIsActorModalOpen}
                actor={selectedActor}
                onSuccess={fetchData}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Drama</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>"{dramaToDelete?.title}"</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDramaToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteDrama} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AdminNewsModal
                open={isNewsModalOpen}
                onClose={() => setIsNewsModalOpen(false)}
                onSave={fetchNews}
                news={selectedNews}
            />
        </>
    );
};

export default AdminDashboard;
