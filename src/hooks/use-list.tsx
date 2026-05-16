import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';
import { Drama } from '@/data/dramas';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './auth-context';
import { userDramaService, UserDramaEntry, UserStats, DramaStatus } from '@/services/userDramaService';
import { mapApiDramaToFrontend } from '@/services/dramaService';

interface ListContextType {
    myList: Drama[];
    userDramas: UserDramaEntry[];
    userStats: UserStats | null;
    isLoading: boolean;
    addToMyList: (drama: Drama) => void;
    removeFromMyList: (id: number) => void;
    isInList: (id: number) => boolean;
    addDramaEntry: (dramaId: number, data: {
        status?: DramaStatus;
        user_rating?: number;
        episodes_watched?: number;
        review?: string;
    }) => Promise<void>;
    updateDramaEntry: (dramaId: number, updates: Partial<UserDramaEntry>) => Promise<void>;
    removeDramaEntry: (dramaId: number) => Promise<void>;
    getDramaEntry: (dramaId: number) => UserDramaEntry | undefined;
    refreshList: () => Promise<void>;
    refreshStats: () => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [myList, setMyList] = useState<Drama[]>([]);
    const [userDramas, setUserDramas] = useState<UserDramaEntry[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Load user dramas when authenticated
    const refreshList = useCallback(async () => {
        if (!isAuthenticated) {
            setUserDramas([]);
            setMyList([]);
            return;
        }

        setIsLoading(true);
        try {
            const list = await userDramaService.getList();
            setUserDramas(list);
            // Convert to Drama format for backwards compatibility
            setMyList(list.map(ud => mapApiDramaToFrontend(ud.drama)));
        } catch (error) {
            console.error('Failed to load user dramas', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const refreshStats = useCallback(async () => {
        if (!isAuthenticated) {
            setUserStats(null);
            return;
        }

        try {
            const stats = await userDramaService.getStats();
            if (stats) {
                setUserStats(stats);
            }
        } catch (error) {
            console.error('Failed to load user stats', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshList();
        refreshStats();
    }, [isAuthenticated, refreshList, refreshStats]);

    // Legacy methods for backwards compatibility
    const addToMyList = (drama: Drama) => {
        addDramaEntry(drama.id, { status: 'plan_to_watch' });
    };

    const removeFromMyList = (id: number) => {
        removeDramaEntry(id);
    };

    const isInList = (id: number) => {
        return userDramas.some(ud => ud.drama_id === id);
    };

    const addDramaEntry = async (dramaId: number, data: {
        status?: DramaStatus;
        user_rating?: number;
        episodes_watched?: number;
        review?: string;
    }) => {
        if (!isAuthenticated) {
            toast({
                title: "Join the Drama Community!",
                description: "Sign in to track your dramas and receive updates.",
                action: (
                    <ToastAction altText="Sign In" onClick={() => navigate('/login')}>
                        Sign In
                    </ToastAction>
                ),
            });
            return;
        }

        try {
            const entry = await userDramaService.addDrama({
                drama_id: dramaId,
                ...data,
            });

            if (entry) {
                setUserDramas(prev => [...prev, entry]);
                setMyList(prev => [...prev, mapApiDramaToFrontend(entry.drama)]);
                toast({
                    title: "Drama Added",
                    description: `${entry.drama.title} has been added to your list.`,
                });
                refreshStats();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add drama.",
                variant: "destructive",
            });
        }
    };

    const updateDramaEntry = async (dramaId: number, updates: Partial<UserDramaEntry>) => {
        if (!isAuthenticated) {
            toast({
                title: "Join the Drama Community!",
                description: "Sign in to track your dramas and receive updates.",
                action: (
                    <ToastAction altText="Sign In" onClick={() => navigate('/login')}>
                        Sign In
                    </ToastAction>
                ),
            });
            return;
        }
        try {
            const entry = await userDramaService.updateDrama(dramaId, updates);

            if (entry) {
                setUserDramas(prev =>
                    prev.map(ud => ud.drama_id === dramaId ? entry : ud)
                );
                toast({
                    title: "Updated",
                    description: "Drama entry updated successfully.",
                });
                refreshStats();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update drama.",
                variant: "destructive",
            });
        }
    };

    const removeDramaEntry = async (dramaId: number) => {
        if (!isAuthenticated) {
            toast({
                title: "Join the Drama Community!",
                description: "Sign in to track your dramas and receive updates.",
                action: (
                    <ToastAction altText="Sign In" onClick={() => navigate('/login')}>
                        Sign In
                    </ToastAction>
                ),
            });
            return;
        }
        try {
            await userDramaService.removeDrama(dramaId);

            setUserDramas(prev => prev.filter(ud => ud.drama_id !== dramaId));
            setMyList(prev => prev.filter(d => d.id !== dramaId));
            toast({
                title: "Removed",
                description: "Drama removed from your list.",
            });
            refreshStats();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove drama.",
                variant: "destructive",
            });
        }
    };

    const getDramaEntry = (dramaId: number) => {
        return userDramas.find(ud => ud.drama_id === dramaId);
    };

    return (
        <ListContext.Provider value={{
            myList,
            userDramas,
            userStats,
            isLoading,
            addToMyList,
            removeFromMyList,
            isInList,
            addDramaEntry,
            updateDramaEntry,
            removeDramaEntry,
            getDramaEntry,
            refreshList,
            refreshStats,
        }}>
            {children}
        </ListContext.Provider>
    );
};

export const useList = () => {
    const context = useContext(ListContext);
    if (context === undefined) {
        throw new Error('useList must be used within a ListProvider');
    }
    return context;
};

export type { DramaStatus, UserDramaEntry };
