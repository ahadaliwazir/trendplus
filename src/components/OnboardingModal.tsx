import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Sparkles, Heart, Film, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
    open: boolean;
    onComplete: () => void;
}

const GENRE_OPTIONS = [
    { id: 'romance', name: 'Romance', emoji: '💕' },
    { id: 'drama', name: 'Drama', emoji: '🎭' },
    { id: 'thriller', name: 'Thriller', emoji: '🔥' },
    { id: 'comedy', name: 'Comedy', emoji: '😂' },
    { id: 'family', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'social', name: 'Social Issues', emoji: '🌍' },
    { id: 'mystery', name: 'Mystery', emoji: '🔍' },
    { id: 'action', name: 'Action', emoji: '⚡' },
];

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
    const [step, setStep] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleGenre = (genreId: string) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            // Save preferences to backend
            await api.post('/users/preferences', {
                favorite_genres: selectedGenres
            });
            toast.success('Preferences saved! We\'ll recommend dramas you\'ll love.');
            onComplete();
        } catch (error) {
            console.error('Failed to save preferences:', error);
            // Still complete even if save fails
            onComplete();
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-lg bg-gradient-to-br from-card to-card/95 border-accent/20 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

                <DialogHeader className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <DialogTitle className="text-2xl font-display font-bold">
                            Welcome to DramaList! 🎬
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Tell us what you love, and we'll recommend dramas just for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 relative z-10">
                    {/* Step 1: Genre Selection */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            What genres do you enjoy?
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Select at least 2 to get personalized recommendations
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {GENRE_OPTIONS.map(genre => (
                                <button
                                    key={genre.id}
                                    onClick={() => toggleGenre(genre.id)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                                        ${selectedGenres.includes(genre.id)
                                            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                                            : 'border-border hover:border-accent/50 bg-secondary/20'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{genre.emoji}</span>
                                    <span className="font-medium">{genre.name}</span>
                                    {selectedGenres.includes(genre.id) && (
                                        <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {selectedGenres.length > 0 && (
                            <p className="text-sm text-accent font-medium">
                                ✨ {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border relative z-10">
                    <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                        Skip for now
                    </Button>
                    <Button
                        variant="gold"
                        onClick={handleComplete}
                        disabled={loading || selectedGenres.length < 2}
                        className="gap-2 min-w-[140px]"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
