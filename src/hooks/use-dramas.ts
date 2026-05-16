import { useState, useEffect, useCallback } from 'react';
import { Drama } from '@/data/dramas';
import { dramaService } from '@/services/dramaService';

interface UseDramasOptions {
    status?: 'airing' | 'completed' | 'upcoming';
    search?: string;
    autoFetch?: boolean;
}

interface UseDramasResult {
    dramas: Drama[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useDramas = (options: UseDramasOptions = {}): UseDramasResult => {
    const { status, search, autoFetch = true } = options;
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDramas = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let result: Drama[];

            if (status === 'airing') {
                result = await dramaService.getAiring();
            } else if (status === 'upcoming') {
                result = await dramaService.getUpcoming();
            } else {
                const { dramas: fetchedDramas } = await dramaService.getAll({
                    status,
                    search,
                    limit: 50
                });
                result = fetchedDramas;
            }

            setDramas(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dramas');
            console.error('Failed to fetch dramas:', err);
        } finally {
            setIsLoading(false);
        }
    }, [status, search]);

    useEffect(() => {
        if (autoFetch) {
            fetchDramas();
        }
    }, [autoFetch, fetchDramas]);

    return {
        dramas,
        isLoading,
        error,
        refetch: fetchDramas,
    };
};

export const useTopRatedDramas = (page = 1, limit = 20) => {
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<{
        total: number;
        page: number;
        pages: number;
        limit: number;
    } | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getTopRated(page, limit);
                setDramas(result.dramas);
                setPagination(result.pagination);
            } catch (err) {
                console.error('Failed to fetch top rated dramas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();
    }, [page, limit]);

    return { dramas, isLoading, pagination };
};

export const useAiringDramas = () => {
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getAiring();
                setDramas(result);
            } catch (err) {
                console.error('Failed to fetch airing dramas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();
    }, []);

    return { dramas, isLoading };
};

export const useUpcomingDramas = () => {
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getUpcoming();
                setDramas(result);
            } catch (err) {
                console.error('Failed to fetch upcoming dramas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();
    }, []);

    return { dramas, isLoading };
};

export const useRecommendedDramas = (limit = 15) => {
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getRecommended(limit);
                setDramas(result);
            } catch (err) {
                console.error('Failed to fetch recommended dramas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();
    }, [limit]);

    return { dramas, isLoading };
};

export const useFeaturedAiringDramas = () => {
    const [dramas, setDramas] = useState<Drama[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getFeaturedAiring();
                setDramas(result);
            } catch (err) {
                console.error('Failed to fetch featured airing dramas:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetch();
    }, []);

    return { dramas, isLoading };
};
