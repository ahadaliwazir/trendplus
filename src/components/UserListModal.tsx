import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Lock, Globe, Check, FolderHeart, ArrowLeft, Loader2, ListPlus, X } from 'lucide-react';
import socialService, { UserList } from '@/services/socialService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/auth-context';
import { useNavigate } from 'react-router-dom';
import { DialogClose } from '@/components/ui/dialog';

interface UserListModalProps {
    dramaId: number;
    trigger?: React.ReactNode;
}

export const UserListModal = ({ dramaId, trigger }: UserListModalProps) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState<UserList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // New list form
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const fetchLists = async () => {
        setIsLoading(true);
        try {
            const data = await socialService.getUserLists();
            setLists(data);
        } catch (error) {
            toast.error('Failed to load your lists');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && isAuthenticated) {
            fetchLists();
        }
    }, [open, isAuthenticated]);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        try {
            await socialService.createList(newListName, newListDesc, isPublic);
            toast.success('Collection created!');
            setNewListName('');
            setNewListDesc('');
            setIsCreating(false);
            fetchLists();
        } catch (error) {
            toast.error('Failed to create collection');
        }
    };

    const toggleDramaInList = async (list: UserList) => {
        const isAlreadyIn = list.dramas?.some(d => d.id === dramaId);

        try {
            if (isAlreadyIn) {
                await socialService.removeDramaFromList(list.id, dramaId);
                toast.success(`Removed from ${list.name}`);
            } else {
                await socialService.addDramaToList(list.id, dramaId);
                toast.success(`Saved to ${list.name}`);
            }
            fetchLists();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 active:scale-95">
                        <ListPlus className="w-4 h-4" /> Save to List
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] bg-[#0A0A0A] border-white/10 text-white backdrop-blur-2xl p-0 overflow-hidden shadow-2xl ring-1 ring-white/20 [&>button]:hidden">
                {/* Background Glow Decorations */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[100px] pointer-events-none" />

                {/* Explicit Close Button */}
                <DialogClose className="absolute right-4 top-4 z-50 rounded-full p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5">
                    <X className="w-4 h-4" />
                </DialogClose>

                <div className="p-6 relative z-10">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent decoration-none">
                            {!isAuthenticated ? 'Join the Community' : isCreating ? 'Create New Collection' : 'Save to Collection'}
                        </DialogTitle>
                    </DialogHeader>

                    {!isAuthenticated ? (
                        <div className="text-center py-8 space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-primary/20">
                                <FolderHeart className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Sign in Required</h3>
                                <p className="text-white/40 text-sm max-w-[280px] mx-auto">
                                    Create your own collections to organize and share your favorite dramas!
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button
                                    className="h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg"
                                    onClick={() => navigate('/login')}
                                >
                                    Login to Continue
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-white/40 hover:text-white hover:bg-white/5"
                                    onClick={() => setOpen(false)}
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {!isCreating ? (
                                <motion.div
                                    key="list-view"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="space-y-6"
                                >
                                    {/* Existing list view content ... */}
                                    <ScrollArea className="h-[320px] -mr-2 pr-4">
                                        <div className="space-y-3 pb-2">
                                            {isLoading ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                    <p className="text-sm">Fetching your collections...</p>
                                                </div>
                                            ) : lists.length > 0 ? (
                                                lists.map((list) => {
                                                    const isInList = list.dramas?.some(d => d.id === dramaId);
                                                    return (
                                                        <motion.div
                                                            key={list.id}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${isInList
                                                                ? 'bg-primary/10 border-primary/40'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                                                }`}
                                                            onClick={() => toggleDramaInList(list)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isInList ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/60 group-hover:text-white'
                                                                    }`}>
                                                                    <FolderHeart className="w-5 h-5" strokeWidth={2.5} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-sm leading-tight text-white">{list.name}</span>
                                                                    <span className="text-[11px] text-white/50 flex items-center gap-1.5 mt-1">
                                                                        {list.dramas?.length || 0} items • {list.is_public ? <Globe className="w-3 h-3 text-white/40" /> : <Lock className="w-3 h-3 text-white/40" />}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {isInList ? (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                                                >
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </motion.div>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/40 transition-colors" />
                                                            )}
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-20">
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <ListPlus className="w-8 h-8 text-white/20" />
                                                    </div>
                                                    <p className="text-white/40 text-sm">No collections found.</p>
                                                    <p className="text-white/20 text-xs mt-1">Start by creating your first list!</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <Button
                                        className="w-full h-12 gap-2 border-dashed border-white/20 hover:bg-white/5 hover:border-primary/50 text-white/80 hover:text-white transition-all group"
                                        variant="outline"
                                        onClick={() => setIsCreating(true)}
                                    >
                                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                        <span>Create New Collection</span>
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="create-view"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">List Name</Label>
                                            <Input
                                                value={newListName}
                                                onChange={(e) => setNewListName(e.target.value)}
                                                placeholder="e.g. Must-Watch Classics"
                                                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all text-base placeholder:text-white/20"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Description (Optional)</Label>
                                            <Input
                                                value={newListDesc}
                                                onChange={(e) => setNewListDesc(e.target.value)}
                                                placeholder="What's this collection about?"
                                                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                            />
                                        </div>

                                        <div
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                                            onClick={() => setIsPublic(!isPublic)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    {isPublic ? <Globe className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4 text-amber-500" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">Public Access</span>
                                                    <span className="text-[11px] text-white/40">{isPublic ? 'Anyone can see this list' : 'Only you can see this list'}</span>
                                                </div>
                                            </div>
                                            <Checkbox
                                                id="public"
                                                checked={isPublic}
                                                onCheckedChange={(c) => setIsPublic(!!c)}
                                                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-12 hover:bg-white/5 gap-2"
                                            onClick={() => setIsCreating(false)}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold"
                                            onClick={handleCreateList}
                                            disabled={!newListName.trim()}
                                        >
                                            Create Collection
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
