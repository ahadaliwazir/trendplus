import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { reviewService, UserReview, ReviewComment } from '@/services/reviewService';
import { Star, MessageCircle, PlayCircle, Heart, Send, Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth-context';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
    review: UserReview;
    showDramaInfo?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, showDramaInfo = false }) => {
    const { isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(review.is_liked || false);
    const [likeCount, setLikeCount] = useState(review.like_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<ReviewComment[]>([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isUpdatingComment, setIsUpdatingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const { user: currentUser } = useAuth();

    // Review edit/delete state
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [editedReviewContent, setEditedReviewContent] = useState(review.content);
    const [editedReviewRating, setEditedReviewRating] = useState(review.rating);
    const [isUpdatingReview, setIsUpdatingReview] = useState(false);
    const [isDeletingReview, setIsDeletingReview] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to like reviews");
            return;
        }

        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await reviewService.toggleLike(review.id);
        } catch (error) {
            // Revert on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error("Failed to update like");
        }
    };

    const toggleComments = async () => {
        setShowComments(!showComments);
        if (!showComments && !commentsLoaded) {
            try {
                const fetchedComments = await reviewService.getComments(review.id);
                setComments(fetchedComments);
                setCommentsLoaded(true);
            } catch (error) {
                toast.error("Failed to load comments");
            }
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const comment = await reviewService.addComment(review.id, newComment);
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (error: any) {
            // Show actual error message from backend (API uses fetch, throws {message} directly)
            const message = error?.message || 'Failed to post comment';
            toast.error(message);

            // Handle force logout for banned users
            if (error?.force_logout) {
                setTimeout(() => {
                    localStorage.removeItem('dramalist_token');
                    window.location.href = '/login';
                }, 2000);
            }
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleUpdateComment = async (commentId: number) => {
        if (!editContent.trim()) return;
        setIsUpdatingComment(true);
        try {
            const updated = await reviewService.updateComment(commentId, editContent);
            setComments(prev => prev.map(c => c.id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditContent('');
            toast.success("Comment updated");
        } catch (error) {
            toast.error("Failed to update comment");
        } finally {
            setIsUpdatingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        console.log('FRONTEND: handleDeleteComment triggered for ID:', commentId);

        // First click sets the confirming state
        if (deletingCommentId !== commentId) {
            console.log('FRONTEND: Enabling confirmation mode for comment:', commentId);
            setDeletingCommentId(commentId);
            // Auto-reset after 4 seconds if not confirmed
            setTimeout(() => {
                setDeletingCommentId(prev => prev === commentId ? null : prev);
            }, 4000);
            return;
        }

        console.log('FRONTEND: Deletion confirmed by user');
        console.log('FRONTEND: Current User State:', {
            id: currentUser?.id,
            idType: typeof currentUser?.id,
            role: currentUser?.role,
            isAuthenticated
        });

        try {
            console.log('FRONTEND: Sending delete request for comment:', commentId);
            await reviewService.deleteComment(commentId);
            console.log('FRONTEND: Delete request successful');
            setComments(prev => prev.filter(c => c.id !== commentId));
            setDeletingCommentId(null);
            toast.success("Comment deleted");
        } catch (error) {
            console.error('FRONTEND: Failed to delete comment:', error);
            toast.error("Failed to delete comment");
            setDeletingCommentId(null);
        }
    };

    // Review edit/delete handlers
    const handleUpdateReview = async () => {
        if (!editedReviewContent.trim()) return;
        setIsUpdatingReview(true);
        try {
            await reviewService.updateReview(review.id, {
                content: editedReviewContent,
                rating: editedReviewRating
            });
            review.content = editedReviewContent;
            review.rating = editedReviewRating;
            setIsEditingReview(false);
            toast.success("Review updated");
        } catch (error: any) {
            toast.error(error?.message || "Failed to update review");
        } finally {
            setIsUpdatingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!isDeletingReview) {
            setIsDeletingReview(true);
            setTimeout(() => setIsDeletingReview(false), 4000);
            return;
        }
        try {
            await reviewService.deleteReview(review.id);
            setIsDeleted(true);
            toast.success("Review deleted");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete review");
            setIsDeletingReview(false);
        }
    };

    // Don't render if deleted
    if (isDeleted) return null;

    return (
        <Card className="bg-card border-border overflow-hidden mb-4">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Drama Poster Section (Optional) */}
                    {showDramaInfo && review.drama && (
                        <div
                            className="md:w-48 h-48 md:h-auto relative cursor-pointer group shrink-0"
                            onClick={() => {
                                window.location.href = `/dashboard?open=${review.drama?.id}`;
                            }}
                        >
                            <img
                                src={review.drama.image_url}
                                alt={review.drama.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                                <h4 className="text-white font-bold drop-shadow-md truncate">{review.drama.title}</h4>
                                <p className="text-white/80 text-xs drop-shadow-md">{review.drama.year}</p>
                            </div>
                        </div>
                    )}

                    {/* Review Content */}
                    <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={review.user.avatar} />
                                    <AvatarFallback>{review.user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Link to={`/user/${review.user.username}`} className="font-semibold hover:text-primary transition-colors">
                                        {review.user.username}
                                    </Link>
                                    {showDramaInfo && (
                                        <p className="text-xs text-muted-foreground">
                                            watched <span className="text-foreground font-medium">{review.drama?.title}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-secondary/30 px-2 py-1 rounded">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold">{isEditingReview ? editedReviewRating : review.rating}</span>
                                </div>
                                {/* Edit/Delete buttons for owner */}
                                {isAuthenticated && currentUser?.id === review.user_id && !isEditingReview && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setIsEditingReview(true)}
                                            className="p-1.5 hover:text-primary transition-colors"
                                            title="Edit review"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleDeleteReview}
                                            className={cn(
                                                "p-1.5 transition-colors",
                                                isDeletingReview ? "text-red-500 animate-pulse" : "hover:text-red-500"
                                            )}
                                            title={isDeletingReview ? "Click again to confirm" : "Delete review"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Content - Edit Mode or View Mode */}
                        <div className="mb-4">
                            {isEditingReview ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Rating:</span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setEditedReviewRating(i + 1)}
                                                    className={`w-5 h-5 ${i < editedReviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                                                >
                                                    <Star className="w-full h-full" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea
                                        value={editedReviewContent}
                                        onChange={(e) => setEditedReviewContent(e.target.value)}
                                        className="bg-secondary/30 border-none min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleUpdateReview}
                                            disabled={isUpdatingReview}
                                        >
                                            {isUpdatingReview ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsEditingReview(false);
                                                setEditedReviewContent(review.content);
                                                setEditedReviewRating(review.rating);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground leading-relaxed">"{review.content}"</p>
                            )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/50 pt-4">
                            <span>
                                {review.created_at
                                    ? new Date(review.created_at).toLocaleDateString() !== 'Invalid Date'
                                        ? new Date(review.created_at).toLocaleDateString()
                                        : 'Recently'
                                    : 'Recently'}
                            </span>

                            <button
                                onClick={handleLike}
                                className={cn(
                                    "flex items-center gap-2 transition-colors hover:text-primary",
                                    isLiked && "text-red-500 hover:text-red-600"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                                <span>{likeCount}</span>
                            </button>

                            <button
                                onClick={toggleComments}
                                className="flex items-center gap-2 transition-colors hover:text-primary"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>{comments.length > 0 ? comments.length : (review.comment_count || 0)}</span>
                            </button>
                        </div>

                        {/* Comments Section */}
                        {showComments && (
                            <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                                {/* Comment List */}
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={comment.user.avatar} />
                                                <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-secondary/20 rounded-lg p-3 text-sm group relative">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-semibold text-foreground text-xs">
                                                        {comment.user.username}
                                                    </div>

                                                    {isAuthenticated && currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin') && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {currentUser.id === comment.user_id && editingCommentId !== comment.id && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingCommentId(comment.id);
                                                                        setEditContent(comment.content);
                                                                    }}
                                                                    className="p-1.5 hover:text-primary transition-colors"
                                                                    title="Edit comment"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteComment(comment.id);
                                                                }}
                                                                className={cn(
                                                                    "p-1.5 transition-colors rounded-full",
                                                                    deletingCommentId === comment.id
                                                                        ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                                                                        : "hover:text-red-500"
                                                                )}
                                                                title={deletingCommentId === comment.id ? "Click again to confirm" : "Delete comment"}
                                                            >
                                                                {deletingCommentId === comment.id ? (
                                                                    <span className="text-[10px] font-bold px-1">CONFIRM?</span>
                                                                ) : (
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingCommentId === comment.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="min-h-[60px] text-xs py-2"
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 px-2 text-[10px]"
                                                                onClick={() => setEditingCommentId(null)}
                                                            >
                                                                <X className="w-3 h-3 mr-1" /> Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="h-7 px-2 text-[10px]"
                                                                disabled={isUpdatingComment || !editContent.trim()}
                                                                onClick={() => handleUpdateComment(comment.id)}
                                                            >
                                                                <Check className="w-3 h-3 mr-1" /> Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {commentsLoaded && comments.length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
                                    )}
                                </div>

                                {/* Comment Form */}
                                {isAuthenticated && (
                                    <form onSubmit={handlePostComment} className="flex gap-2 items-end">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="min-h-[40px] h-[40px] py-2 resize-none text-sm"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={isSubmittingComment || !newComment.trim()}
                                            className="h-[40px] w-[40px]"
                                            variant="secondary"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
