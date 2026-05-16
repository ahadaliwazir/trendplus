import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Play, CheckCircle2, Calendar, PauseCircle, XCircle, X, Loader2 } from 'lucide-react';
import { Drama } from '@/data/dramas';
import { useList, DramaStatus } from '@/hooks/use-list';
import { dramaService } from '@/services/dramaService';

interface AddDramaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editDramaId?: number;
}

const statusOptions: { value: DramaStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'watching', label: 'Watching', icon: <Play className="w-4 h-4" />, color: 'text-blue-500' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald' },
    { value: 'plan_to_watch', label: 'Plan to Watch', icon: <Calendar className="w-4 h-4" />, color: 'text-accent' },
    { value: 'on_hold', label: 'On Hold', icon: <PauseCircle className="w-4 h-4" />, color: 'text-yellow-500' },
    { value: 'dropped', label: 'Dropped', icon: <XCircle className="w-4 h-4" />, color: 'text-red-500' },
];

const AddDramaModal = ({ open, onOpenChange, editDramaId }: AddDramaModalProps) => {
    const { addDramaEntry, updateDramaEntry, getDramaEntry, userDramas } = useList();

    const [step, setStep] = useState<'select' | 'details'>(editDramaId ? 'details' : 'select');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
    const [status, setStatus] = useState<DramaStatus>('plan_to_watch');
    const [rating, setRating] = useState<number>(0);
    const [review, setReview] = useState('');
    const [episodesWatched, setEpisodesWatched] = useState(0);

    const [allDramas, setAllDramas] = useState<Drama[]>([]);
    const [isLoadingDramas, setIsLoadingDramas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load dramas from API
    useEffect(() => {
        const loadDramas = async () => {
            setIsLoadingDramas(true);
            try {
                const { dramas } = await dramaService.getAll({ limit: 100 });
                setAllDramas(dramas);
            } catch (error) {
                console.error('Failed to load dramas', error);
            } finally {
                setIsLoadingDramas(false);
            }
        };

        if (open) {
            loadDramas();
        }
    }, [open]);

    // Get existing entry if editing
    const existingEntry = useMemo(() => {
        return selectedDrama ? getDramaEntry(selectedDrama.id) : undefined;
    }, [selectedDrama, getDramaEntry]);

    // Load existing data when editing
    useEffect(() => {
        if (existingEntry) {
            setStatus(existingEntry.status);
            setRating(existingEntry.user_rating || 0);
            setReview(existingEntry.review || '');
            setEpisodesWatched(existingEntry.episodes_watched);
        }
    }, [existingEntry]);

    // Filter dramas not already in user's list
    const availableDramas = useMemo(() => {
        const userDramaIds = userDramas.map(d => d.drama_id);
        return allDramas.filter(d =>
            !userDramaIds.includes(d.id) &&
            d.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, userDramas, allDramas]);

    const handleSelectDrama = (drama: Drama) => {
        setSelectedDrama(drama);
        setStep('details');
        // Reset form
        setStatus('plan_to_watch');
        setRating(0);
        setReview('');
        setEpisodesWatched(0);
    };

    const handleSubmit = async () => {
        if (!selectedDrama) return;

        setIsSubmitting(true);

        try {
            if (existingEntry) {
                await updateDramaEntry(selectedDrama.id, {
                    status,
                    user_rating: rating > 0 ? rating : null,
                    review,
                    episodes_watched: status === 'completed' ? selectedDrama.episodes : episodesWatched,
                });
            } else {
                await addDramaEntry(selectedDrama.id, {
                    status,
                    user_rating: rating > 0 ? rating : undefined,
                    episodes_watched: status === 'completed' ? selectedDrama.episodes : episodesWatched,
                    review: review || undefined,
                });
            }

            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after close animation
        setTimeout(() => {
            setStep('select');
            setSearchQuery('');
            setSelectedDrama(null);
            setStatus('plan_to_watch');
            setRating(0);
            setReview('');
            setEpisodesWatched(0);
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display">
                        {step === 'select' ? 'Add Drama to Your List' : 'Drama Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select'
                            ? 'Search and select a drama to add to your collection'
                            : 'Set your progress and rating for this drama'
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'select' && (
                    <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search dramas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary/30 border-none"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[400px]">
                            {isLoadingDramas ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : availableDramas.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No dramas found or all dramas already added
                                </div>
                            ) : (
                                availableDramas.map((drama) => (
                                    <div
                                        key={drama.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors"
                                        onClick={() => handleSelectDrama(drama)}
                                    >
                                        <img
                                            src={drama.image}
                                            alt={drama.title}
                                            className="w-12 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-foreground truncate">{drama.title}</h4>
                                            <p className="text-sm text-muted-foreground">{drama.channel} • {drama.year}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3 h-3 fill-accent text-accent" />
                                                <span className="text-xs text-muted-foreground">{drama.rating}</span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{drama.episodes} eps</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {step === 'details' && selectedDrama && (
                    <div className="space-y-5 overflow-y-auto pr-2 max-h-[500px]">
                        {/* Selected Drama Header */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                            <img
                                src={selectedDrama.image}
                                alt={selectedDrama.title}
                                className="w-16 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{selectedDrama.title}</h3>
                                <p className="text-sm text-muted-foreground">{selectedDrama.channel} • {selectedDrama.year}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">{selectedDrama.episodes} Episodes</Badge>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-accent text-accent" />
                                        <span className="text-sm">{selectedDrama.rating}</span>
                                    </div>
                                </div>
                            </div>
                            {!editDramaId && (
                                <Button variant="ghost" size="icon" onClick={() => setStep('select')}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as DramaStatus)}>
                                <SelectTrigger className="bg-secondary/30 border-none">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <span className={option.color}>{option.icon}</span>
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Episodes Watched (for non-completed status) */}
                        {status !== 'completed' && status !== 'plan_to_watch' && (
                            <div className="space-y-2">
                                <Label>Episodes Watched</Label>
                                <div className="flex items-center gap-4">
                                    <Slider
                                        value={[episodesWatched]}
                                        onValueChange={(val) => setEpisodesWatched(val[0])}
                                        max={selectedDrama.episodes}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-sm text-muted-foreground w-16 text-right">
                                        {episodesWatched} / {selectedDrama.episodes}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Rating */}
                        <div className="space-y-2">
                            <Label>Your Rating (Optional)</Label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRating(rating === num ? 0 : num)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${num <= rating
                                                ? 'bg-accent text-accent-foreground'
                                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Your score: <span className="text-accent font-semibold">{rating}/10</span>
                                </p>
                            )}
                        </div>

                        {/* Review */}
                        <div className="space-y-2">
                            <Label>Review (Optional)</Label>
                            <Textarea
                                placeholder="Share your thoughts about this drama..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                className="bg-secondary/30 border-none min-h-[100px] resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            variant="gold"
                            className="w-full h-12 text-base font-semibold"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {existingEntry ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                existingEntry ? 'Update Entry' : 'Add to List'
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddDramaModal;
