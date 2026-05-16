import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { voteService } from '@/services/voteService';
import { useAuth } from '@/hooks/auth-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoteStarsProps {
    dramaId: number;
    size?: 'sm' | 'md' | 'lg';
    showStats?: boolean;
    className?: string;
    onVoteChange?: (rating: number) => void;
}

const VoteStars = ({
    dramaId,
    size = 'md',
    showStats = true,
    className,
    onVoteChange
}: VoteStarsProps) => {
    const { isAuthenticated } = useAuth();
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ average: 0, count: 0 });

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    useEffect(() => {
        loadVoteData();
    }, [dramaId, isAuthenticated]);

    const loadVoteData = async () => {
        try {
            // Get stats for everyone
            const voteStats = await voteService.getVoteStats(dramaId);
            setStats({
                average: voteStats.averageRating,
                count: voteStats.totalVotes
            });

            // Get user's vote if authenticated
            if (isAuthenticated) {
                const myVote = await voteService.getMyVote(dramaId);
                setUserRating(myVote.effectiveRating);
            }
        } catch (error) {
            console.error('Failed to load vote data:', error);
        }
    };

    const handleVote = async (rating: number) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        setIsLoading(true);
        try {
            await voteService.submitVote(dramaId, rating);
            setUserRating(rating);
            toast.success(`Rated ${rating}/10`);
            onVoteChange?.(rating);

            // Refresh stats
            const voteStats = await voteService.getVoteStats(dramaId);
            setStats({
                average: voteStats.averageRating,
                count: voteStats.totalVotes
            });
        } catch (error) {
            toast.error('Failed to submit vote');
        } finally {
            setIsLoading(false);
        }
    };

    const displayRating = hoverRating || userRating || 0;

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={isLoading}
                        className={cn(
                            'transition-all duration-150 hover:scale-110',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => handleVote(star)}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                star <= displayRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-white/20 hover:text-yellow-400/50'
                            )}
                        />
                    </button>
                ))}
                {(hoverRating || userRating) && (
                    <span className="ml-2 text-sm font-bold text-white">
                        {hoverRating || userRating}/10
                    </span>
                )}
            </div>

            {showStats && stats.count > 0 && (
                <div className="text-xs text-white/50">
                    <span className="font-semibold text-primary">{stats.average}</span>
                    {' '}average from{' '}
                    <span className="font-semibold">{stats.count}</span>
                    {' '}vote{stats.count !== 1 ? 's' : ''}
                </div>
            )}

            {userRating && (
                <div className="text-[10px] text-white/40">
                    Your rating: {userRating}/10
                </div>
            )}
        </div>
    );
};

export default VoteStars;
