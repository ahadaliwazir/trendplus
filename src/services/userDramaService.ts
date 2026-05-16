import { api } from './api';
import { DramaFromApi, mapApiDramaToFrontend } from './dramaService';

// Types
export type DramaStatus = 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped';

export interface UserDramaEntry {
    id: number;
    drama_id: number;
    status: DramaStatus;
    user_rating: number | null;
    episodes_watched: number;
    review: string | null;
    is_favorite: boolean;
    date_started: string | null;
    date_completed: string | null;
    drama: DramaFromApi;
}

export interface UserStats {
    total: number;
    watching: number;
    completed: number;
    plan_to_watch: number;
    on_hold: number;
    dropped: number;
    mean_score: string;
    total_episodes: number;
    days_watched: number;
}

// User Drama Service
export const userDramaService = {
    // Get user's drama list
    async getList(status?: DramaStatus) {
        const query = status ? `?status=${status}` : '';
        const response = await api.get<{ userDramas: UserDramaEntry[] }>(`/user/dramas${query}`);
        return response.data?.userDramas || [];
    },

    // Get user statistics
    async getStats() {
        const response = await api.get<{ stats: UserStats }>('/user/stats');
        return response.data?.stats;
    },

    // Add drama to list
    async addDrama(data: {
        drama_id: number;
        status?: DramaStatus;
        user_rating?: number;
        episodes_watched?: number;
        review?: string;
    }) {
        const response = await api.post<{ userDrama: UserDramaEntry }>('/user/dramas', data);
        return response.data?.userDrama;
    },

    // Update drama entry
    async updateDrama(
        dramaId: number,
        data: {
            status?: DramaStatus;
            user_rating?: number | null;
            episodes_watched?: number;
            review?: string;
            is_favorite?: boolean;
        }
    ) {
        const response = await api.put<{ userDrama: UserDramaEntry }>(`/user/dramas/${dramaId}`, data);
        return response.data?.userDrama;
    },

    // Remove drama from list
    async removeDrama(dramaId: number) {
        return api.delete(`/user/dramas/${dramaId}`);
    },
};
