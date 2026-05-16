import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth-context';
import socialService, { Comment } from '@/services/socialService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Reply, Send, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';

interface CommentProps {
    comment: Comment;
    dramaId: string | number;
    depth?: number;
    onReplySuccess: () => void;
}

const CommentItem = ({ comment, dramaId, depth = 0, onReplySuccess }: CommentProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAuthenticated } = useAuth();

    // Limit nesting depth to prevent layout breaking
    const maxDepth = 3;
    const isMaxDepth = depth >= maxDepth;

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            await socialService.postComment(dramaId, replyContent, comment.id);
            setReplyContent('');
            setIsReplying(false);
            onReplySuccess();
            toast.success('Reply posted!');
        } catch (error) {
            toast.error('Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`space-y-4 ${depth > 0 ? 'ml-6 md:ml-12 border-l-2 border-white/5 pl-4' : ''}`}>
            <div className="flex gap-4 group">
                <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={comment.user.image_url} />
                    <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{comment.user.username}</span>
                        <span className="text-xs text-white/40">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>

                    <div className="pt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-0 text-white/40 hover:text-primary text-xs flex items-center gap-1.5"
                            onClick={() => isAuthenticated ? setIsReplying(!isReplying) : toast.error('Please login to reply')}
                        >
                            <Reply className="w-3 h-3" /> Reply
                        </Button>
                    </div>

                    {isReplying && (
                        <div className="mt-4 flex gap-3 animate-fade-in">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Reply to ${comment.user.username}...`}
                                className="min-h-[80px] bg-white/5 border-white/10 text-white focus:border-primary/50"
                            />
                            <div className="flex flex-col gap-2">
                                <Button size="icon" onClick={handleReply} disabled={isSubmitting} className="h-10 w-10">
                                    <Send className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setIsReplying(false)} className="h-10 w-10 text-white/40 hover:text-destructive">
                                    <CornerDownRight className="w-4 h-4 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursively render replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4 pt-2">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            dramaId={dramaId}
                            depth={depth + 1}
                            onReplySuccess={onReplySuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const CommentThread = ({ dramaId }: { dramaId: string | number }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchComments = async () => {
        try {
            const data = await socialService.getDramaComments(dramaId);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [dramaId]);

    const handlePostComment = async () => {
        if (!content.trim()) return;
        setIsPosting(true);
        try {
            await socialService.postComment(dramaId, content);
            setContent('');
            fetchComments();
            toast.success('Comment posted!');
        } catch (error) {
            toast.error('Failed to post comment');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Post Box */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Discussion <span className="text-white/40 text-sm font-normal">({comments.length})</span>
                </h3>

                {isAuthenticated ? (
                    <div className="space-y-4">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts about this drama..."
                            className="bg-black/20 border-white/10 text-white min-h-[100px] focus:border-primary/50"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handlePostComment}
                                disabled={isPosting || !content.trim()}
                                className="px-6"
                            >
                                {isPosting ? 'Posting...' : 'Post Comment'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5 border-dashed">
                        <p className="text-white/60 mb-3">Join the conversation</p>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Log in to Comment</Button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-white/5 rounded" />
                                    <div className="h-16 w-full bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            dramaId={dramaId}
                            onReplySuccess={fetchComments}
                        />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
                        <p className="text-white/40">No comments yet. Be the first to start the discussion!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
