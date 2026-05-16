import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
    Calendar, Film, Star, Clock, Play, CheckCircle2,
    PauseCircle, XCircle, BookMarked, Heart, User,
    Tv, Award, TrendingUp
} from 'lucide-react';
import myDramaListService, { PublicListData, PublicDramaItem } from '@/services/myDramaListService';

const statusConfig = {
    watching: { label: 'Currently Watching', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    plan_to_watch: { label: 'Plan to Watch', icon: BookMarked, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
    on_hold: { label: 'On Hold', icon: PauseCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    dropped: { label: 'Dropped', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

const MyDramaListPublic = () => {
    const { shareToken } = useParams<{ shareToken: string }>();
    const [data, setData] = useState<PublicListData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<keyof typeof statusConfig>('completed');

    useEffect(() => {
        const loadPublicList = async () => {
            if (!shareToken) return;

            try {
                setLoading(true);
                const listData = await myDramaListService.getPublicList(shareToken);
                setData(listData);

                // Set initial active tab to the one with most items
                const statusCounts = [
                    { status: 'completed', count: listData.list.completed.length },
                    { status: 'watching', count: listData.list.watching.length },
                    { status: 'plan_to_watch', count: listData.list.plan_to_watch.length },
                    { status: 'on_hold', count: listData.list.on_hold.length },
                    { status: 'dropped', count: listData.list.dropped.length },
                ];
                const maxStatus = statusCounts.reduce((a, b) => a.count > b.count ? a : b);
                if (maxStatus.count > 0) {
                    setActiveTab(maxStatus.status as keyof typeof statusConfig);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'This list is not available');
            } finally {
                setLoading(false);
            }
        };

        loadPublicList();
    }, [shareToken]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading drama list...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">List Not Available</h1>
                    <p className="text-gray-400 mb-6">{error || 'This drama list is either private or does not exist.'}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                        <Tv className="w-5 h-5" />
                        <span>Explore Dramas</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { user, stats, list } = data;

    return (
        <>
            <SEO
                title={`${user.username}'s Drama List | MeriDramaList`}
                description={`Check out ${user.username}'s drama list with ${stats.total} dramas. Mean Score: ${stats.mean_score}`}
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
                {/* Header with Gradient Background */}
                <div className="relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
                    </div>

                    <div className="container mx-auto px-4 py-12 relative z-10">
                        {/* User Profile Card */}
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-50"></div>
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="relative w-28 h-28 rounded-full border-4 border-blue-500/50 object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {user.username}'s <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Drama List</span>
                                </h1>
                                {user.bio && (
                                    <p className="text-gray-400 max-w-xl mb-2">{user.bio}</p>
                                )}
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since {new Date(user.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
                            <StatCard
                                icon={Film}
                                label="Total Dramas"
                                value={stats.total}
                                gradient="from-purple-500 to-indigo-500"
                            />
                            <StatCard
                                icon={Star}
                                label="Mean Score"
                                value={stats.mean_score}
                                gradient="from-yellow-500 to-orange-500"
                            />
                            <StatCard
                                icon={CheckCircle2}
                                label="Completed"
                                value={stats.completed}
                                gradient="from-emerald-500 to-teal-500"
                            />
                            <StatCard
                                icon={Play}
                                label="Watching"
                                value={stats.watching}
                                gradient="from-blue-500 to-cyan-500"
                            />
                            <StatCard
                                icon={Clock}
                                label="Days Watched"
                                value={stats.days_watched}
                                gradient="from-pink-500 to-rose-500"
                            />
                            <StatCard
                                icon={Heart}
                                label="Favorites"
                                value={stats.favorites}
                                gradient="from-red-500 to-pink-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Drama List Tabs */}
                <div className="container mx-auto px-4 pb-16">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                        {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig.watching][]).map(([status, config]) => {
                            const count = list[status]?.length || 0;
                            const Icon = config.icon;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === status
                                        ? `${config.bg} ${config.color} ${config.border} border`
                                        : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{config.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === status ? 'bg-white/20' : 'bg-slate-600/50'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Drama Grid */}
                    {list[activeTab]?.length === 0 ? (
                        <div className="text-center py-16">
                            <div className={`w-20 h-20 ${statusConfig[activeTab].bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                {(() => {
                                    const Icon = statusConfig[activeTab].icon;
                                    return <Icon className={`w-10 h-10 ${statusConfig[activeTab].color}`} />;
                                })()}
                            </div>
                            <p className="text-gray-400">No dramas in this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {list[activeTab]?.map((drama) => (
                                <DramaCard
                                    key={drama.id}
                                    drama={drama}
                                    status={activeTab}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Branding */}
                <div className="border-t border-slate-800/50 py-8">
                    <div className="container mx-auto px-4 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <Tv className="w-5 h-5 text-purple-400" />
                            <span className="font-semibold">MeriDramaList</span>
                        </Link>
                        <p className="text-sm text-gray-500 mt-2">Track, Rate & Share Your Favorite Pakistani Dramas</p>
                    </div>
                </div>
            </div>
        </>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, gradient }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    gradient: string;
}) => (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center hover:scale-105 transition-transform">
        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
    </div>
);

// Drama Card Component
const DramaCard = ({ drama, status }: {
    drama: PublicDramaItem;
    status: keyof typeof statusConfig;
}) => (
    <div
        className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
    >
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden">
            <img
                src={drama.poster}
                alt={drama.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Overlay with Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-gray-300 line-clamp-2">{drama.genres.join(', ')}</p>
                </div>
            </div>

            {/* Favorite Badge */}
            {drama.is_favorite && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-4 h-4 text-white fill-white" />
                </div>
            )}

            {/* User Rating */}
            {drama.user_rating && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 rounded-lg flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 text-black fill-black" />
                    <span className="text-xs font-bold text-black">{drama.user_rating}</span>
                </div>
            )}
        </div>

        {/* Title & Info */}
        <div className="p-3">
            <h3 className="font-medium text-white text-sm line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                {drama.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{drama.year}</span>
                {drama.channel && <span>{drama.channel}</span>}
            </div>
            {status === 'watching' && drama.total_episodes && (
                <div className="mt-2">
                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${(drama.episodes_watched / drama.total_episodes) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{drama.episodes_watched}/{drama.total_episodes} eps</p>
                </div>
            )}
        </div>
    </div>
);

export default MyDramaListPublic;
