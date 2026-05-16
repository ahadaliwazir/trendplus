import { api } from './api';
import { Drama } from '@/data/dramas';
import { mapApiDramaToFrontend, DramaFromApi } from './dramaService';

export interface RecommendationItem {
    drama: Drama;
    reason: string;
    matchingActors: { id: number; name: string; image_url?: string }[];
    score: number;
}

export interface RecommendationResponse {
    recommendations: RecommendationItem[];
    basedOn: 'actor_overlap' | 'top_rated' | 'popular';
    topActors?: { id: number; name: string; image_url?: string }[];
}

export const recommendationService = {
    // Get personalized recommendations (requires login)
    async getRecommendations(limit = 20): Promise<RecommendationResponse> {
        const response = await api.get<{
            data: {
                recommendations: {
                    drama: DramaFromApi;
                    reason: string;
                    matchingActors: { id: number; name: string; image_url?: string }[];
                    score: number;
                }[];
                basedOn: 'actor_overlap' | 'top_rated' | 'popular';
                topActors?: { id: number; name: string; image_url?: string }[];
            }
        }>(`/recommendations?limit=${limit}`);

        const data = response.data?.data;
        return {
            recommendations: data?.recommendations?.map(r => ({
                drama: mapApiDramaToFrontend(r.drama),
                reason: r.reason,
                matchingActors: r.matchingActors || [],
                score: r.score
            })) || [],
            basedOn: data?.basedOn || 'popular',
            topActors: data?.topActors
        };
    },

    // Get popular recommendations (no login required)
    async getPopularRecommendations(limit = 20): Promise<RecommendationResponse> {
        const response = await api.get<{
            data: {
                recommendations: {
                    drama: DramaFromApi;
                    reason: string;
                    matchingActors: { id: number; name: string; image_url?: string }[];
                    score: number;
                }[];
                basedOn: 'popular';
            }
        }>(`/recommendations/popular?limit=${limit}`);

        const data = response.data?.data;
        return {
            recommendations: data?.recommendations?.map(r => ({
                drama: mapApiDramaToFrontend(r.drama),
                reason: r.reason,
                matchingActors: r.matchingActors || [],
                score: r.score
            })) || [],
            basedOn: 'popular'
        };
    }
};
