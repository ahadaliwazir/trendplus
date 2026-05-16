import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { newsService, News } from '@/services/newsService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminNewsModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    news?: News | null;
}

const CATEGORIES = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'cast_news', label: 'Cast News' },
    { value: 'awards', label: 'Awards' },
    { value: 'industry', label: 'Industry' },
    { value: 'review', label: 'Review' },
    { value: 'other', label: 'Other' },
];

const AdminNewsModal = ({ open, onClose, onSave, news }: AdminNewsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        excerpt: string;
        image_url: string;
        category: 'announcement' | 'cast_news' | 'awards' | 'industry' | 'review' | 'other';
        source_url: string;
        is_featured: boolean;
    }>({
        title: '',
        content: '',
        excerpt: '',
        image_url: '',
        category: 'other',
        source_url: '',
        is_featured: false,
    });

    useEffect(() => {
        if (news) {
            setFormData({
                title: news.title || '',
                content: news.content || '',
                excerpt: news.excerpt || '',
                image_url: news.image_url || '',
                category: news.category || 'other',
                source_url: news.source_url || '',
                is_featured: news.is_featured || false,
            });
        } else {
            setFormData({
                title: '',
                content: '',
                excerpt: '',
                image_url: '',
                category: 'other',
                source_url: '',
                is_featured: false,
            });
        }
    }, [news, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Title and content are required');
            return;
        }

        setLoading(true);
        try {
            if (news?.id) {
                await newsService.update(news.id, formData);
                toast.success('News article updated');
            } else {
                await newsService.create(formData);
                toast.success('News article created');
            }
            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save news article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {news ? 'Edit News Article' : 'Add News Article'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter news title"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex items-end">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                />
                                <Label htmlFor="is_featured">Featured Article</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt/Summary</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Brief summary of the article (optional)"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Full article content..."
                            rows={8}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source_url">Source URL</Label>
                        <Input
                            id="source_url"
                            value={formData.source_url}
                            onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                            placeholder="https://original-source.com/article"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {news ? 'Update Article' : 'Create Article'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminNewsModal;
