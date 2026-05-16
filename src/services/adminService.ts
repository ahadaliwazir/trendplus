import { api } from './api';
import { User } from './authService';
import { DramaFromApi } from './dramaService';

export interface AdminStats {
    totalUsers: number;
    totalDramas: number;
    totalReviews: number;
    recentUsers: Partial<User>[];
}

export const adminService = {
    // Stats
    async getStats() {
        const response = await api.get<AdminStats>('/admin/stats');
        return response.data;
    },

    // User Management
    async getUsers(page = 1, limit = 20, search = '') {
        const response = await api.get<{ users: User[]; pagination: any }>(
            `/admin/users?page=${page}&limit=${limit}&search=${search}`
        );
        return response.data;
    },

    async updateUserRole(userId: number, role: 'user' | 'admin') {
        return api.put(`/admin/users/${userId}/role`, { role });
    },

    async deleteUser(userId: number) {
        return api.delete(`/admin/users/${userId}`);
    },

    // Drama Management
    async createDrama(dramaData: any) {
        return api.post<{ drama: DramaFromApi }>('/admin/dramas', dramaData);
    },

    async updateDrama(id: number, dramaData: any) {
        return api.put<{ drama: DramaFromApi }>(`/admin/dramas/${id}`, dramaData);
    },

    async deleteDrama(id: number) {
        return api.delete(`/admin/dramas/${id}`);
    },

    // Actor Management
    async updateActor(id: number, actorData: any) {
        return api.put(`/actors/${id}`, actorData);
    },

    async deleteActor(id: number) {
        return api.delete(`/actors/${id}`);
    },

    // Featured Rankings
    async updateFeaturedRank(dramaId: number, rank: number | null) {
        return api.put(`/admin/dramas/${dramaId}/featured-rank`, { rank });
    },

    // YouTube Sync
    async syncYouTubeEpisodes() {
        return api.post<{ success: boolean; message: string }>('/admin/agents/youtube-sync', {});
    }
};
