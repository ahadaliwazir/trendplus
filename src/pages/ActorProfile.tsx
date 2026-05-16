import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { ArrowLeft, Star, Calendar, MapPin, Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { api } from '@/services/api';
import { useDramaModal } from '@/hooks/use-drama-modal';

interface Actor {
    id: number;
    name: string;
    image_url: string | null;
    bio: string | null;
    birth_date: string | null;
    birth_place: string | null;
    dramas: {
        id: number;
        title: string;
        year: number;
        imdb_rating: number;
        image_url: string;
        status: string;
        channel: { id: number; name: string };
        drama_cast?: { role_name?: string; is_lead?: boolean };
    }[];
}

const ActorProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [actor, setActor] = useState<Actor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useDramaModal();

    useEffect(() => {
        const fetchActor = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await api.get<{ actor: Actor }>(`/actors/${id}`);
                setActor(response.data?.actor || null);
            } catch (err: any) {
                setError(err.message || 'Failed to load actor');
            } finally {
                setLoading(false);
            }
        };
        fetchActor();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-[70vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            </div>
        );
    }

    if (error || !actor) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 pt-24 text-center">
                    <h1 className="text-2xl font-bold mb-4">Actor Not Found</h1>
                    <p className="text-muted-foreground mb-6">{error || 'This actor does not exist.'}</p>
                    <Link to="/">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <SEO
                title={actor.name}
                description={`Learn about ${actor.name}, Pakistani drama actor. View their complete filmography, biography, and drama appearances on MeriDramaList.`}
                keywords={`${actor.name}, Pakistani actor, ${actor.name} dramas, Pakistani drama cast`}
                url={`/actor/${id}`}
            />

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="container mx-auto px-4 pt-24 pb-12">
                    {/* Back Button */}
                    <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Actor Header */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        {/* Photo */}
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-secondary/30 flex-shrink-0 mx-auto md:mx-0">
                            {actor.image_url ? (
                                <img
                                    src={actor.image_url}
                                    alt={actor.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground">
                                    {actor.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{actor.name}</h1>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-sm text-muted-foreground">
                                {actor.birth_date && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(actor.birth_date)}</span>
                                    </div>
                                )}
                                {actor.birth_place && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span>{actor.birth_place}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Film className="w-4 h-4" />
                                    <span>{actor.dramas?.length || 0} Dramas</span>
                                </div>
                            </div>

                            {actor.bio && (
                                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                    {actor.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Filmography */}
                    <section>
                        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                            <Film className="w-6 h-6 text-accent" />
                            Filmography
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {actor.dramas?.map((drama) => (
                                <div
                                    key={drama.id}
                                    onClick={() => openModal({
                                        id: drama.id,
                                        title: drama.title,
                                        year: drama.year,
                                        rating: drama.imdb_rating,
                                        image: drama.image_url,
                                        channel: drama.channel?.name || '',
                                        status: drama.status as any,
                                        episodes: 1,
                                        genre: [],
                                        synopsis: '',
                                        cast: []
                                    })}
                                    className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-colors cursor-pointer"
                                >
                                    <div className="aspect-[2/3] relative overflow-hidden">
                                        <img
                                            src={drama.image_url || 'https://placehold.co/200x300/1a1a1a/666?text=No+Image'}
                                            alt={drama.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {drama.drama_cast?.is_lead && (
                                            <Badge className="absolute top-2 left-2 bg-accent text-xs">Lead</Badge>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">
                                            {drama.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                                            <span>{drama.year}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-accent text-accent" />
                                                {drama.imdb_rating}
                                            </div>
                                        </div>
                                        {drama.drama_cast?.role_name && (
                                            <p className="text-xs text-accent/80 mt-1 italic line-clamp-1">
                                                as {drama.drama_cast.role_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!actor.dramas || actor.dramas.length === 0) && (
                            <p className="text-center text-muted-foreground py-12">
                                No dramas found for this actor.
                            </p>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
};

export default ActorProfile;
