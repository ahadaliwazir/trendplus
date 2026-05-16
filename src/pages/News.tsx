import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { Calendar, Eye, ChevronRight, Newspaper, Award, Users, Tv, Star, Filter } from 'lucide-react';
import { newsService, News } from '@/services/newsService';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_INFO: Record<string, { label: string; icon: any; color: string }> = {
    announcement: { label: 'Announcement', icon: Newspaper, color: 'bg-blue-500' },
    cast_news: { label: 'Cast News', icon: Users, color: 'bg-purple-500' },
    awards: { label: 'Awards', icon: Award, color: 'bg-yellow-500' },
    industry: { label: 'Industry', icon: Tv, color: 'bg-green-500' },
    review: { label: 'Review', icon: Star, color: 'bg-orange-500' },
    other: { label: 'Other', icon: Newspaper, color: 'bg-gray-500' },
};

const NewsPage = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedArticle, setSelectedArticle] = useState<News | null>(null);

    useEffect(() => {
        fetchNews();
    }, [selectedCategory]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params: any = { limit: 50 };
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }
            const data = await newsService.getAll(params);
            setNews(data.news || []);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryInfo = (category: string) => {
        return CATEGORY_INFO[category] || CATEGORY_INFO.other;
    };

    return (
        <>
            <SEO
                title="Drama News"
                description="Stay updated with the latest Pakistani drama news, announcements, cast updates, awards, and industry updates from Hum TV, ARY Digital, and Geo Entertainment."
                keywords="Pakistani drama news, drama announcements, Pak drama updates, Hum TV news, ARY Digital news"
                url="/news"
            />

            <div className="min-h-screen bg-background text-foreground pb-20">
                <Navbar />

                <div className="container mx-auto px-4 pt-24">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black font-display text-white mb-2 flex items-center gap-3">
                                <Newspaper className="w-10 h-10 text-accent" />
                                Drama News
                            </h1>
                            <p className="text-muted-foreground">
                                Stay updated with the latest Pakistani drama news, announcements, and industry updates
                            </p>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Button
                            variant={selectedCategory === 'all' ? 'gold' : 'secondary'}
                            size="sm"
                            onClick={() => setSelectedCategory('all')}
                            className="gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            All News
                        </Button>
                        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                            const Icon = info.icon;
                            return (
                                <Button
                                    key={key}
                                    variant={selectedCategory === key ? 'gold' : 'secondary'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(key)}
                                    className="gap-2"
                                >
                                    <Icon className="w-4 h-4" />
                                    {info.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* News Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-card rounded-xl overflow-hidden">
                                    <Skeleton className="h-48 w-full" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-16">
                            <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">No News Yet</h3>
                            <p className="text-muted-foreground">
                                {selectedCategory === 'all'
                                    ? 'News articles will appear here once published.'
                                    : `No ${CATEGORY_INFO[selectedCategory]?.label} articles found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((article) => {
                                const catInfo = getCategoryInfo(article.category);
                                const CatIcon = catInfo.icon;
                                return (
                                    <article
                                        key={article.id}
                                        className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-accent/10"
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden bg-secondary">
                                            {article.image_url ? (
                                                <img
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Newspaper className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${catInfo.color} flex items-center gap-1`}>
                                                <CatIcon className="w-3 h-3" />
                                                {catInfo.label}
                                            </div>
                                            {article.is_featured && (
                                                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-3">
                                            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-accent transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {article.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(article.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {article.views} views
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Article Modal */}
                {selectedArticle && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedArticle(null)}
                    >
                        <div
                            className="bg-card max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedArticle.image_url && (
                                <img
                                    src={selectedArticle.image_url}
                                    alt={selectedArticle.title}
                                    className="w-full h-64 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge className={getCategoryInfo(selectedArticle.category).color}>
                                        {getCategoryInfo(selectedArticle.category).label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(selectedArticle.created_at)}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">{selectedArticle.title}</h2>
                                <div className="prose prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
                                </div>
                                {selectedArticle.source_url && (
                                    <a
                                        href={selectedArticle.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-6 text-accent hover:underline"
                                    >
                                        Read Original Source
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                )}
                                <Button
                                    variant="ghost"
                                    className="mt-6 w-full"
                                    onClick={() => setSelectedArticle(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NewsPage;
