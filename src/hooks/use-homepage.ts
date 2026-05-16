import { useState, useEffect } from 'react';
import { Drama } from '@/data/dramas';
import { dramaService } from '@/services/dramaService';

interface HomepageData {
    heroDramas: Drama[];
    featuredAiring: Drama[];
    airingDramas: Drama[];
    upcomingDramas: Drama[];
    topRatedDramas: Drama[];
    recommendedDramas: Drama[];
}

export const useHomepage = () => {
    const [data, setData] = useState<HomepageData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await dramaService.getHomepageData();
                setData(result);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch homepage data');
                console.error('Homepage fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        data,
        isLoading,
        error,
        heroDramas: data?.heroDramas || [],
        featuredAiring: data?.featuredAiring || [],
        airingDramas: data?.airingDramas || [],
        upcomingDramas: data?.upcomingDramas || [],
        topRatedDramas: data?.topRatedDramas || [],
        recommendedDramas: data?.recommendedDramas || [],
    };
};
