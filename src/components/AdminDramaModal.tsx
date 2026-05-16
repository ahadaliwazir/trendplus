import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { dramaService } from '@/services/dramaService';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import {
    Loader2, Plus, Trash2,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
    ZoomIn, ZoomOut, Move, Monitor, Smartphone, Grid3X3, RotateCcw,
    UserRound, UserCheck, AlignVerticalJustifyCenter, ScanFace
} from 'lucide-react';
import { ActorAutocomplete } from '@/components/ActorAutocomplete';

interface AdminDramaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drama?: any;
    onSuccess: () => void;
}

interface CastEntry {
    name: string;
    role_name: string;
    is_lead: boolean;
}

const AdminDramaModal = ({ open, onOpenChange, drama, onSuccess }: AdminDramaModalProps) => {
    const [loading, setLoading] = useState(false);
    const [channels, setChannels] = useState<{ id: number; name: string }[]>([]);
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        year: new Date().getFullYear(),
        imdb_rating: 0,
        episodes: 1,
        status: 'upcoming',
        channel_id: '',
        synopsis: '',
        image_url: '',
        genreIds: [] as number[],
        is_hero: false,
        hero_image_url: '',
        hero_pos_x: 50,
        hero_pos_y: 10, // Default to 10% (Top) to focus on heads/faces
        hero_scale: 1.0,
        vote_count: '0',
        site_rating: 0,
        trailer_url: '',
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPos, setInitialPos] = useState({ x: 50, y: 50 });
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [showGrid, setShowGrid] = useState(true);
    const previewRef = useRef<HTMLDivElement>(null);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialPos({ x: formData.hero_pos_x, y: formData.hero_pos_y });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging && previewRef.current) {
            const rect = previewRef.current.getBoundingClientRect();
            // Sensitivity for percentage-based movement
            const sensitivity = 0.5;

            const dx = ((e.clientX - dragStart.x) / rect.width) * 100 * sensitivity;
            const dy = ((e.clientY - dragStart.y) / rect.height) * 100 * sensitivity;

            setFormData(prev => ({
                ...prev,
                hero_pos_x: Math.round(Math.max(0, Math.min(100, initialPos.x - dx))),
                hero_pos_y: Math.round(Math.max(0, Math.min(100, initialPos.y - dy)))
            }));
        }
    };

    const onMouseUp = () => setIsDragging(false);

    const handleFocalPointClick = (e: React.MouseEvent) => {
        // Only if not dragging (just a click)
        if (isDragging) return;
        if (!previewRef.current) return;

        const rect = previewRef.current.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setFormData(prev => ({
            ...prev,
            hero_pos_x: Math.round(xPercent),
            hero_pos_y: Math.round(yPercent)
        }));
    };

    const handleReset = () => {
        setFormData(prev => ({
            ...prev,
            hero_pos_x: 50,
            hero_pos_y: 10,
            hero_scale: 1.0
        }));
    };

    const applyPreset = (y: number, scale?: number) => {
        setFormData(prev => ({
            ...prev,
            hero_pos_y: y,
            hero_scale: scale || prev.hero_scale
        }));
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setFormData(prev => ({
            ...prev,
            hero_scale: Math.round(Math.max(0.5, Math.min(5.0, prev.hero_scale + delta)) * 100) / 100
        }));
    };

    // Touch support
    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches[0]) {
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            setInitialPos({ x: formData.hero_pos_x, y: formData.hero_pos_y });
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (isDragging && e.touches[0] && previewRef.current) {
            const rect = previewRef.current.getBoundingClientRect();
            const sensitivity = 0.5;
            const dx = ((e.touches[0].clientX - dragStart.x) / rect.width) * 100 * sensitivity;
            const dy = ((e.touches[0].clientY - dragStart.y) / rect.height) * 100 * sensitivity;

            setFormData(prev => ({
                ...prev,
                hero_pos_x: Math.round(Math.max(0, Math.min(100, initialPos.x - dx))),
                hero_pos_y: Math.round(Math.max(0, Math.min(100, initialPos.y - dy)))
            }));
        }
    };

    const [castData, setCastData] = useState<CastEntry[]>([]);

    // Fetch full drama details when editing to get cast data
    const loadDramaDetails = async (dramaId: number) => {
        try {
            const dramaDetails = await dramaService.getByIdRaw(dramaId);
            if (dramaDetails && dramaDetails.cast && Array.isArray(dramaDetails.cast)) {
                setCastData(dramaDetails.cast.map((c: any) => ({
                    name: c.name || '',
                    role_name: c.drama_cast?.role_name || '',
                    is_lead: c.drama_cast?.is_lead || false
                })));
            }
        } catch (error) {
            console.error('Failed to load drama cast:', error);
        }
    };

    useEffect(() => {
        if (open) {
            loadInitialData();
            if (drama) {
                setFormData({
                    title: drama.title || '',
                    year: drama.year || new Date().getFullYear(),
                    imdb_rating: drama.imdb_rating || drama.rating || 0,
                    episodes: drama.episodes || 1,
                    status: drama.status || 'upcoming',
                    channel_id: drama.channel_id ? drama.channel_id.toString() : '',
                    synopsis: drama.synopsis || '',
                    image_url: drama.image_url || drama.image || '',
                    genreIds: drama.genreIds || (drama.genres?.map((g: any) => g.id) || []),
                    is_hero: drama.is_hero || false,
                    hero_image_url: drama.hero_image_url || '',
                    hero_pos_x: drama.hero_pos_x !== undefined ? drama.hero_pos_x : 50,
                    hero_pos_y: drama.hero_pos_y !== undefined ? drama.hero_pos_y : 50,
                    hero_scale: drama.hero_scale !== undefined ? parseFloat(drama.hero_scale as any) : 1.0,
                    vote_count: drama.voteCount || drama.vote_count || '0',
                    site_rating: drama.siteRating || drama.site_rating || 0,
                    trailer_url: drama.trailerUrl || drama.trailer_url || '',
                });
                // Fetch full drama details to get cast
                loadDramaDetails(drama.id);
            } else {
                setFormData({
                    title: '',
                    year: new Date().getFullYear(),
                    imdb_rating: 0,
                    episodes: 1,
                    status: 'upcoming',
                    channel_id: '',
                    synopsis: '',
                    image_url: '',
                    genreIds: [],
                    is_hero: false,
                    hero_image_url: '',
                    hero_pos_x: 50,
                    hero_pos_y: 50,
                    hero_scale: 1.0,
                    vote_count: '0',
                    site_rating: 0,
                    trailer_url: '',
                });
                setCastData([]);
            }
        }
    }, [open, drama]);

    // Added Logic: If channel_id is missing but we have channels loaded and a channel name, match it
    useEffect(() => {
        if (open && drama && channels.length > 0) {
            if (!formData.channel_id && drama.channel) {
                const channelName = typeof drama.channel === 'string' ? drama.channel : drama.channel.name;
                const found = channels.find(c => c.name === channelName);
                if (found) {
                    setFormData(prev => ({ ...prev, channel_id: found.id.toString() }));
                }
            }
        }
    }, [channels, drama, open]);

    const loadInitialData = async () => {
        try {
            const [channelsData, genresData] = await Promise.all([
                dramaService.getChannels(),
                dramaService.getGenres()
            ]);
            setChannels(channelsData);
            setGenres(genresData);
        } catch (error) {
            toast.error('Failed to load form data');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter out empty cast entries
            const validCastData = castData.filter(c => c.name.trim() !== '');

            const submitData = {
                ...formData,
                year: parseInt(formData.year.toString()) || new Date().getFullYear(),
                episodes: parseInt(formData.episodes.toString()) || 1,
                imdb_rating: parseFloat(formData.imdb_rating.toString()) || 0,
                channel_id: formData.channel_id ? parseInt(formData.channel_id.toString()) : null,
                trailer_url: formData.trailer_url?.trim() || '',
                castData: validCastData
            };

            if (drama) {
                await adminService.updateDrama(drama.id, submitData);
                toast.success('Drama updated successfully');
            } else {
                await adminService.createDrama(submitData);
                toast.success('Drama created successfully');
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Save error:', error);
            // Better error message extraction
            const errorMsg = error.errors && error.errors.length > 0
                ? `${error.message}: ${error.errors[0].message}`
                : error.message || 'Failed to save drama';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGenreToggle = (genreId: number) => {
        setFormData(prev => ({
            ...prev,
            genreIds: prev.genreIds.includes(genreId)
                ? prev.genreIds.filter(id => id !== genreId)
                : [...prev.genreIds, genreId]
        }));
    };

    // Cast management helpers
    const addCastMember = () => {
        setCastData(prev => [...prev, { name: '', role_name: '', is_lead: false }]);
    };

    const removeCastMember = (index: number) => {
        setCastData(prev => prev.filter((_, i) => i !== index));
    };

    const updateCastMember = (index: number, field: keyof CastEntry, value: string | boolean) => {
        setCastData(prev => prev.map((cast, i) =>
            i === index ? { ...cast, [field]: value } : cast
        ));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold">
                        {drama ? 'Edit Drama' : 'Add New Drama'}
                    </DialogTitle>
                    <DialogDescription>
                        Enter the details of the Pakistani drama below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="channel">Channel</Label>
                            <Select
                                value={formData.channel_id}
                                onValueChange={val => setFormData({ ...formData, channel_id: val })}
                            >
                                <SelectTrigger className="bg-secondary/30 border-none">
                                    <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {channels.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                required
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                className="bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="episodes">Episodes</Label>
                            <Input
                                id="episodes"
                                type="number"
                                required
                                value={formData.episodes}
                                onChange={e => setFormData({ ...formData, episodes: parseInt(e.target.value) })}
                                className="bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rating">IMDb Rating</Label>
                            <Input
                                id="rating"
                                type="number"
                                step="0.1"
                                value={formData.imdb_rating}
                                onChange={e => setFormData({ ...formData, imdb_rating: parseFloat(e.target.value) })}
                                className="bg-secondary/30 border-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="site_rating">DramaList Rating</Label>
                            <Input
                                id="site_rating"
                                type="number"
                                step="0.1"
                                value={formData.site_rating}
                                onChange={e => setFormData({ ...formData, site_rating: parseFloat(e.target.value) || 0 })}
                                className="bg-secondary/30 border-none"
                                placeholder="0.0 - 10.0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vote_count">Vote Count</Label>
                        <Input
                            id="vote_count"
                            value={formData.vote_count}
                            onChange={e => setFormData({ ...formData, vote_count: e.target.value })}
                            className="bg-secondary/30 border-none"
                            placeholder="e.g. 1.5K, 500, 2M"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={val => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger className="bg-secondary/30 border-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="airing">Airing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image_url">Poster Image URL</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            className="bg-secondary/30 border-none"
                            placeholder="https://example.com/poster.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trailer_url">OST URL (YouTube)</Label>
                        <Input
                            id="trailer_url"
                            value={formData.trailer_url}
                            onChange={e => setFormData({ ...formData, trailer_url: e.target.value })}
                            className="bg-secondary/30 border-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                            <input
                                type="checkbox"
                                id="is_hero"
                                checked={formData.is_hero}
                                onChange={e => setFormData({ ...formData, is_hero: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="is_hero" className="cursor-pointer">Show in Hero Section</Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero_image_url">Hero Image URL (Wide)</Label>
                            <Input
                                id="hero_image_url"
                                value={formData.hero_image_url}
                                onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })}
                                className="bg-secondary/30 border-none"
                                placeholder="https://example.com/banner.jpg"
                                disabled={!formData.is_hero}
                            />
                        </div>
                    </div>

                    {formData.is_hero && (
                        <div className="space-y-4 p-4 bg-secondary/10 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hero Image Editor</Label>
                                <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-lg">
                                    <Button
                                        type="button"
                                        variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setPreviewMode('desktop')}
                                        title="Desktop Preview"
                                    >
                                        <Monitor className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setPreviewMode('mobile')}
                                        title="Mobile Preview"
                                    >
                                        <Smartphone className="w-3 h-3" />
                                    </Button>
                                    <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                    <Button
                                        type="button"
                                        variant={showGrid ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => setShowGrid(!showGrid)}
                                        title="Toggle Composition Grid"
                                    >
                                        <Grid3X3 className={`w-3 h-3 ${showGrid ? 'text-primary' : ''}`} />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={handleReset}
                                        title="Reset Position"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-2 p-2 bg-secondary/5 rounded-lg border border-white/5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 flex flex-col h-12 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => applyPreset(0, 2.5)}
                                >
                                    <ScanFace className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase">Face Close-up</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 flex flex-col h-12 gap-1"
                                    onClick={() => applyPreset(10)}
                                >
                                    <UserRound className="w-4 h-4" />
                                    <span className="text-[9px] uppercase">Focus Heads</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 flex flex-col h-12 gap-1"
                                    onClick={() => applyPreset(45)}
                                >
                                    <UserCheck className="w-4 h-4 text-blue-400" />
                                    <span className="text-[9px] uppercase">Focus Waist</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 flex flex-col h-12 gap-1"
                                    onClick={() => applyPreset(75)}
                                >
                                    <AlignVerticalJustifyCenter className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-[9px] uppercase">Focus Low</span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Horizontal</span>
                                            <span className="text-muted-foreground">{formData.hero_pos_x}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.hero_pos_x}
                                            onChange={e => setFormData({ ...formData, hero_pos_x: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="flex items-center gap-1"><Move className="w-3 h-3 rotate-90" /> Vertical</span>
                                            <span className="text-muted-foreground">{formData.hero_pos_y}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.hero_pos_y}
                                            onChange={e => setFormData({ ...formData, hero_pos_y: parseInt(e.target.value) })}
                                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom / Scale</span>
                                            <span className="text-muted-foreground">{formData.hero_scale}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="5"
                                            step="0.05"
                                            value={formData.hero_scale}
                                            onChange={e => setFormData({ ...formData, hero_scale: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase mb-2 block">Move Tool</Label>
                                        <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                                            <div />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setFormData({ ...formData, hero_pos_y: Math.max(0, formData.hero_pos_y - 1) })}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                            <div />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setFormData({ ...formData, hero_pos_x: Math.max(0, formData.hero_pos_x - 1) })}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center justify-center">
                                                <div className="w-1 h-1 bg-primary/40 rounded-full" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setFormData({ ...formData, hero_pos_x: Math.min(100, formData.hero_pos_x + 1) })}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                            <div />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setFormData({ ...formData, hero_pos_y: Math.min(100, formData.hero_pos_y + 1) })}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                            <div />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        ref={previewRef}
                                        className={`relative rounded-lg overflow-hidden bg-black ring-1 ring-white/10 group select-none transition-all duration-500 ease-in-out ${previewMode === 'desktop' ? 'aspect-[2.1/1]' : 'aspect-[4/5]'
                                            } ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
                                        onMouseDown={onMouseDown}
                                        onMouseMove={onMouseMove}
                                        onMouseUp={onMouseUp}
                                        onMouseLeave={onMouseUp}
                                        onClick={handleFocalPointClick}
                                        onWheel={handleWheel}
                                        onTouchStart={onTouchStart}
                                        onTouchMove={onTouchMove}
                                        onTouchEnd={() => setIsDragging(false)}
                                    >
                                        {/* Blurred background for zoom-out fallback */}
                                        <img
                                            src={formData.hero_image_url || formData.image_url || 'https://placehold.co/600x400/1a1a1a/666666?text=Preview'}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                                        />
                                        <img
                                            src={formData.hero_image_url || formData.image_url || 'https://placehold.co/600x400/1a1a1a/666666?text=Preview'}
                                            alt="Position preview"
                                            className="relative w-full h-full object-cover pointer-events-none transition-transform duration-75"
                                            style={{
                                                objectPosition: `${formData.hero_pos_x}% ${formData.hero_pos_y}%`,
                                                transform: `scale(${formData.hero_scale})`
                                            }}
                                        />

                                        {/* Rule of Thirds Grid */}
                                        {showGrid && (
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-1/3 w-full h-[1px] bg-white/20" />
                                                <div className="absolute top-2/3 w-full h-[1px] bg-white/20" />
                                                <div className="absolute left-1/3 h-full w-[1px] bg-white/20" />
                                                <div className="absolute left-2/3 h-full w-[1px] bg-white/20" />
                                            </div>
                                        )}


                                        <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-white/50 uppercase tracking-widest backdrop-blur-sm">
                                            {previewMode} view
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-[10px] h-7 gap-1"
                                            onClick={() => setFormData({ ...formData, hero_scale: Math.max(0.5, formData.hero_scale - 0.1) })}
                                        >
                                            <ZoomOut className="w-3 h-3" /> Zoom Out
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-[10px] h-7 gap-1"
                                            onClick={() => setFormData({ ...formData, hero_scale: Math.min(3, formData.hero_scale + 0.1) })}
                                        >
                                            <ZoomIn className="w-3 h-3" /> Zoom In
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="synopsis">Synopsis</Label>
                        <Textarea
                            id="synopsis"
                            value={formData.synopsis}
                            onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                            className="bg-secondary/30 border-none min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Genres</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {genres.map(genre => (
                                <button
                                    key={genre.id}
                                    type="button"
                                    onClick={() => handleGenreToggle(genre.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${formData.genreIds.includes(genre.id)
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                                        }`}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cast Members Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Cast Members</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCastMember}
                                className="gap-1 h-7 text-xs"
                            >
                                <Plus className="w-3 h-3" />
                                Add Cast
                            </Button>
                        </div>

                        {castData.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/20 rounded-lg">
                                No cast members added. Click "Add Cast" to add actors.
                            </p>
                        )}

                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {castData.map((cast, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg">
                                    <ActorAutocomplete
                                        value={cast.name}
                                        onChange={val => updateCastMember(index, 'name', val)}
                                        className="flex-1"
                                        placeholder="Actor name"
                                    />
                                    <Input
                                        placeholder="Role (optional)"
                                        value={cast.role_name}
                                        onChange={e => updateCastMember(index, 'role_name', e.target.value)}
                                        className="bg-secondary/30 border-none w-32"
                                    />
                                    <label className="flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cast.is_lead}
                                            onChange={e => updateCastMember(index, 'is_lead', e.target.checked)}
                                            className="w-3 h-3"
                                        />
                                        Lead
                                    </label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCastMember(index)}
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" className="min-w-[120px]" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {drama ? 'Save Changes' : 'Create Drama'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
};

export default AdminDramaModal;
