import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { adminService } from '@/services/adminService';
import { dramaService } from '@/services/dramaService';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Search, Film } from 'lucide-react';

interface AdminActorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actor?: any;
    onSuccess: () => void;
}

const AdminActorModal = ({ open, onOpenChange, actor, onSuccess }: AdminActorModalProps) => {
    const [loading, setLoading] = useState(false);
    const [dramasLoading, setDramasLoading] = useState(false);
    const [allDramas, setAllDramas] = useState<any[]>([]);
    const [dramaSearch, setDramaSearch] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        image_url: '',
        bio: '',
        birth_date: '',
        birth_place: '',
        drama_ids: [] as number[],
    });

    // Fetch all dramas for selection
    useEffect(() => {
        if (open) {
            fetchDramas();
        }
    }, [open]);

    const fetchDramas = async () => {
        setDramasLoading(true);
        try {
            const data = await dramaService.getAll({ limit: 200 });
            setAllDramas(data.dramas || []);
        } catch (error) {
            console.error('Failed to fetch dramas:', error);
        } finally {
            setDramasLoading(false);
        }
    };

    // Fetch actor details with dramas when editing
    useEffect(() => {
        if (open && actor) {
            fetchActorDetails();
        } else if (open) {
            setFormData({
                name: '',
                image_url: '',
                bio: '',
                birth_date: '',
                birth_place: '',
                drama_ids: [],
            });
        }
    }, [open, actor]);

    const fetchActorDetails = async () => {
        try {
            const response = await api.get<{ actor: any }>(`/actors/${actor.id}`);
            const actorData = response.data?.actor;
            if (actorData) {
                setFormData({
                    name: actorData.name || '',
                    image_url: actorData.image_url || '',
                    bio: actorData.bio || '',
                    birth_date: actorData.birth_date || '',
                    birth_place: actorData.birth_place || '',
                    drama_ids: actorData.dramas?.map((d: any) => d.id) || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch actor details:', error);
        }
    };

    const handleDramaToggle = (dramaId: number) => {
        setFormData(prev => ({
            ...prev,
            drama_ids: prev.drama_ids.includes(dramaId)
                ? prev.drama_ids.filter(id => id !== dramaId)
                : [...prev.drama_ids, dramaId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (actor) {
                await adminService.updateActor(actor.id, formData);
                toast.success('Actor updated successfully');
            } else {
                toast.error('Creating new actors is not supported via this modal yet');
                return;
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Save actor error:', error);
            const errorMsg = error.errors && error.errors.length > 0
                ? `${error.message}: ${error.errors[0].message}`
                : error.message || 'Failed to save actor';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const filteredDramas = allDramas.filter(d =>
        d.title.toLowerCase().includes(dramaSearch.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold">
                        {actor ? 'Edit Actor Profile' : 'Add New Actor'}
                    </DialogTitle>
                    <DialogDescription>
                        Update the details for the actor profile.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary/30 border-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            className="bg-secondary/30 border-none"
                            placeholder="https://example.com/actor.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Birth Date</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={formData.birth_date}
                                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                className="bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birth_place">Birth Place</Label>
                            <Input
                                id="birth_place"
                                value={formData.birth_place}
                                onChange={e => setFormData({ ...formData, birth_place: e.target.value })}
                                className="bg-secondary/30 border-none"
                                placeholder="Lahore, Pakistan"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biography</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-secondary/30 border-none min-h-[100px]"
                            placeholder="Enter actor biography..."
                        />
                    </div>

                    {/* Drama Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Film className="w-4 h-4" />
                            Dramas ({formData.drama_ids.length} selected)
                        </Label>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search dramas..."
                                value={dramaSearch}
                                onChange={e => setDramaSearch(e.target.value)}
                                className="pl-10 bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto bg-secondary/20 rounded-lg p-3 space-y-2">
                            {dramasLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredDramas.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No dramas found</p>
                            ) : (
                                filteredDramas.map(drama => (
                                    <label
                                        key={drama.id}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-secondary/40 cursor-pointer transition-colors"
                                    >
                                        <Checkbox
                                            checked={formData.drama_ids.includes(drama.id)}
                                            onCheckedChange={() => handleDramaToggle(drama.id)}
                                        />
                                        <img
                                            src={drama.image_url}
                                            alt={drama.title}
                                            className="w-8 h-10 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{drama.title}</p>
                                            <p className="text-xs text-muted-foreground">{drama.year}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" className="min-w-[120px]" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminActorModal;
