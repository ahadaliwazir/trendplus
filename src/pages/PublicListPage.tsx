import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import socialService, { UserList } from '@/services/socialService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Lock, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DramaCardSkeleton } from '@/components/DramaCardSkeleton';
import DramaCard from '@/components/DramaCard';
import { useToast } from '@/hooks/use-toast';

export const PublicListPage = () => {
    const { id } = useParams<{ id: string }>();
    const [list, setList] = useState<UserList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied!",
                description: "Shareable link has been copied to your clipboard.",
            });
        } catch (err) {
            toast({
                title: "Sharing Failed",
                description: "Could not copy link to clipboard.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const fetchList = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await socialService.getPublicList(parseInt(id));
                setList(data);
            } catch (err: any) {
                setError(err.message || 'List not found or is private.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchList();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-24">
                    <div className="h-8 w-1/3 bg-white/5 rounded animate-pulse mb-6" />
                    <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse mb-12" />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(10)].map((_, i) => <DramaCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold mb-2">List Not Found</h2>
                    <p className="text-white/40 mb-6">{error}</p>
                    <Link to="/">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Adapt socialService UserList drama type to DramaCard expected type if needed
    // Assuming DramaCard expects 'any' or compatible interface

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{list.name}</h1>
                            {list.is_public ? <Globe className="w-5 h-5 text-white/40" /> : <Lock className="w-5 h-5 text-white/40" />}
                        </div>
                        {list.description && <p className="text-lg text-white/60 max-w-2xl">{list.description}</p>}

                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-white/40 text-sm">Created by</span>
                            <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                    <AvatarImage src={list.user?.avatar} alt={list.user?.username} />
                                    <AvatarFallback className="text-[10px] bg-white/10">{list.user?.username?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{list.user?.username || `User #${list.user_id}`}</span>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" className="gap-2" onClick={handleShare}>
                        <Share2 className="w-4 h-4" /> Share List
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {list.dramas && list.dramas.length > 0 ? (
                        list.dramas.map((drama: any) => (
                            <DramaCard
                                key={drama.id}
                                drama={{
                                    ...drama,
                                    image: drama.image_url, // Map backend image_url to frontend image prop
                                    rating: drama.imdb_rating || 0,
                                    year: drama.year || 0,
                                    status: drama.status || 'completed'
                                }}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-white/40 py-12">This list is empty.</p>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};
