import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { episodeService } from '@/services/episodeService';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, Pencil } from 'lucide-react';

interface AdminEpisodeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drama: any;
}

interface Episode {
    id: number;
    episode_number: number;
    video_url: string;
    duration?: number;
    release_date?: string;
}

export const AdminEpisodeModal = ({ open, onOpenChange, drama }: AdminEpisodeModalProps) => {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        episode_number: '',
        video_url: '',
        duration: '',
        release_date: ''
    });

    useEffect(() => {
        if (open && drama) {
            loadEpisodes();
            resetForm();
        }
    }, [open, drama]);

    const loadEpisodes = async () => {
        if (!drama) return;
        setLoading(true);
        try {
            const data = await episodeService.getByDramaId(drama.id);
            setEpisodes(data);
            // Suggest next episode number
            const maxEp = data.reduce((max: number, ep: Episode) => Math.max(max, ep.episode_number), 0);
            setFormData(prev => ({ ...prev, episode_number: (maxEp + 1).toString() }));
        } catch (error) {
            toast.error('Failed to load episodes');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        // If we have episodes, suggest next number, else 1
        const maxEp = episodes.reduce((max: number, ep: Episode) => Math.max(max, ep.episode_number), 0);
        setFormData({
            episode_number: (maxEp + 1).toString(),
            video_url: '',
            duration: '',
            release_date: ''
        });
    };

    const handleEdit = (episode: Episode) => {
        setEditingId(episode.id);
        setFormData({
            episode_number: episode.episode_number.toString(),
            video_url: episode.video_url,
            duration: episode.duration?.toString() || '',
            release_date: episode.release_date || ''
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this episode?')) return;
        try {
            await episodeService.delete(id);
            toast.success('Episode deleted');
            loadEpisodes();
        } catch (error) {
            toast.error('Failed to delete episode');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!drama) return;

        setSubmitting(true);
        try {
            const data = {
                drama_id: drama.id,
                episode_number: parseInt(formData.episode_number),
                video_url: formData.video_url,
                duration: formData.duration ? parseInt(formData.duration) : null,
                release_date: formData.release_date || null
            };

            if (editingId) {
                await episodeService.update(editingId, data);
                toast.success('Episode updated');
            } else {
                await episodeService.create(data);
                toast.success('Episode added');
            }
            loadEpisodes();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save episode');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Manage Episodes - {drama?.title}</DialogTitle>
                    <DialogDescription>
                        Add or edit episodes for this drama.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* List Section */}
                    <div className="space-y-4 border-r border-border pr-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Episodes ({episodes.length})</h3>
                            <Button variant="ghost" size="sm" onClick={resetForm} disabled={!editingId}>
                                <Plus className="w-4 h-4 mr-1" /> New
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                            ) : episodes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No episodes added yet.</p>
                            ) : (
                                episodes.map(ep => (
                                    <div
                                        key={ep.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${editingId === ep.id ? 'bg-secondary/50 border-primary' : 'bg-card border-border'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Episode {ep.episode_number}</span>
                                            {ep.release_date && <span className="text-xs text-muted-foreground">{ep.release_date}</span>}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(ep)}>
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(ep.id)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">{editingId ? 'Edit Episode' : 'Add New Episode'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ep_number">Episode Number</Label>
                                <Input
                                    id="ep_number"
                                    type="number"
                                    required
                                    value={formData.episode_number}
                                    onChange={e => setFormData({ ...formData, episode_number: e.target.value })}
                                    className="bg-secondary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="video_url">Video URL (YouTube/Embed)</Label>
                                <Input
                                    id="video_url"
                                    required
                                    value={formData.video_url}
                                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                    placeholder="https://youtube.com/..."
                                    className="bg-secondary/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (mins)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="bg-secondary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="release_date">Release Date</Label>
                                    <Input
                                        id="release_date"
                                        type="date"
                                        value={formData.release_date}
                                        onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                        className="bg-secondary/20"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {editingId ? 'Update Episode' : 'Add Episode'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
