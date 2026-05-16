import { api } from './api';

export interface ShareSettings {
    share_token: string | null;
    share_enabled: boolean;
    share_url: string | null;
}

export interface PublicDramaItem {
    id: number;
    title: string;
    poster: string;
    year: number;
    rating: number;
    user_rating: number | null;
    episodes_watched: number;
    total_episodes: number;
    is_favorite: boolean;
    channel: string;
    genres: string[];
}

export interface PublicListStats {
    total: number;
    watching: number;
    completed: number;
    plan_to_watch: number;
    on_hold: number;
    dropped: number;
    mean_score: string | number;
    total_episodes: number;
    days_watched: string;
    favorites: number;
}

export interface PublicListUser {
    username: string;
    avatar: string;
    bio: string;
    member_since: string;
}

export interface PublicListData {
    user: PublicListUser;
    stats: PublicListStats;
    list: {
        watching: PublicDramaItem[];
        completed: PublicDramaItem[];
        plan_to_watch: PublicDramaItem[];
        on_hold: PublicDramaItem[];
        dropped: PublicDramaItem[];
    };
}

// Helper to generate the correct share URL on the frontend
const getShareUrl = (token: string | null): string | null => {
    if (!token) return null;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://meridramalist.com';
    return `${baseUrl}/list/${token}`;
};

const myDramaListService = {
    // Get current user's share settings
    getShareSettings: async (): Promise<ShareSettings> => {
        const response = await api.get<ShareSettings>('/my-list/settings');
        const data = response.data || { share_token: null, share_enabled: false, share_url: null };
        // Override share_url with frontend-generated URL
        data.share_url = getShareUrl(data.share_token);
        return data;
    },

    // Generate or regenerate share link
    generateShareLink: async (): Promise<ShareSettings> => {
        const response = await api.post<ShareSettings>('/my-list/generate', {});
        const data = response.data || { share_token: null, share_enabled: false, share_url: null };
        data.share_url = getShareUrl(data.share_token);
        return data;
    },

    // Toggle sharing on/off
    toggleSharing: async (enabled: boolean): Promise<ShareSettings> => {
        const response = await api.put<ShareSettings>('/my-list/toggle', { enabled });
        const data = response.data || { share_token: null, share_enabled: false, share_url: null };
        data.share_url = getShareUrl(data.share_token);
        return data;
    },

    // Get public list by token (no auth required)
    getPublicList: async (token: string): Promise<PublicListData> => {
        const response = await api.get<PublicListData>(`/my-list/public/${token}`);
        return response.data!;
    }
};

export default myDramaListService;
