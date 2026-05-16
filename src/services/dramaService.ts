import { api } from './api';
import { Drama } from '@/data/dramas';

// Types from backend
export interface DramaFromApi {
    id: number;
    title: string;
    year: number;
    imdb_rating: number;
    episodes: number;
    current_episode?: number;
    status: 'airing' | 'completed' | 'upcoming';
    synopsis: string;
    image_url: string;
    vote_count?: string;
    site_rating?: number;
    site_vote_count?: number;
    trailer_url?: string;
    cast_names?: string;
    is_hero?: boolean;
    hero_image_url?: string;
    hero_pos_x?: number;
    hero_pos_y?: number;
    hero_scale?: number;
    feature_rank?: number | null;
    channel: {
        id: number;
        name: string;
    };
    genres: {
        id: number;
        name: string;
    }[];
    cast?: {
        id: number;
        name: string;
        image_url?: string;
        drama_cast?: {
            role_name?: string;
            is_lead?: boolean;
        };
    }[];
}

// Convert API drama to frontend Drama type
export const mapApiDramaToFrontend = (apiDrama: DramaFromApi): Drama => ({
    id: apiDrama.id,
    title: apiDrama.title,
    year: apiDrama.year,
    rating: apiDrama.imdb_rating,
    siteRating: apiDrama.site_rating || 0,
    siteVoteCount: apiDrama.site_vote_count || 0,
    episodes: apiDrama.episodes,
    currentEpisode: apiDrama.current_episode,
    status: apiDrama.status,
    genre: apiDrama.genres?.map(g => g.name) || [],
    channel: apiDrama.channel?.name || '',
    synopsis: apiDrama.synopsis,
    image: apiDrama.image_url || 'https://placehold.co/300x450/1a1a1a/666666?text=No+Image',
    cast: apiDrama.cast_names
        ? apiDrama.cast_names.split(',').map(name => name.trim())
        : (apiDrama.cast?.map(c => c.name) || []),   // Fallback to association if cast_names missing
    voteCount: apiDrama.vote_count,
    trailerUrl: apiDrama.trailer_url,
    channel_id: apiDrama.channel?.id,
    imdb_rating: apiDrama.imdb_rating,
    image_url: apiDrama.image_url,
    genreIds: apiDrama.genres?.map(g => g.id) || [],
    is_hero: apiDrama.is_hero,
    hero_image_url: apiDrama.hero_image_url,
    hero_pos_x: apiDrama.hero_pos_x,
    hero_pos_y: apiDrama.hero_pos_y,
    hero_scale: apiDrama.hero_scale ? parseFloat(apiDrama.hero_scale as any) : 1.0,
    feature_rank: apiDrama.feature_rank,
});

// Drama Service
export const dramaService = {
    // Get all dramas
    async getAll(params?: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const query = queryParams.toString();
        const response = await api.get<{ dramas: DramaFromApi[]; pagination: any }>(
            `/dramas${query ? `?${query}` : ''}`
        );

        return {
            dramas: response.data?.dramas.map(mapApiDramaToFrontend) || [],
            pagination: response.data?.pagination,
        };
    },

    // Get single drama
    async getById(id: number) {
        const response = await api.get<{ drama: DramaFromApi }>(`/dramas/${id}`);
        return response.data?.drama ? mapApiDramaToFrontend(response.data.drama) : null;
    },

    // Get single drama (raw API response for admin use)
    async getByIdRaw(id: number): Promise<DramaFromApi | null> {
        const response = await api.get<{ drama: DramaFromApi }>(`/dramas/${id}`);
        return response.data?.drama || null;
    },

    // Get top rated
    async getTopRated(page = 1, limit = 20) {
        const response = await api.get<{ dramas: DramaFromApi[]; pagination: any }>(`/dramas/top-rated?page=${page}&limit=${limit}`);
        return {
            dramas: response.data?.dramas.map(mapApiDramaToFrontend) || [],
            pagination: response.data?.pagination
        };
    },

    // Get currently airing
    async getAiring() {
        const response = await api.get<{ dramas: DramaFromApi[] }>('/dramas/airing');
        return response.data?.dramas.map(mapApiDramaToFrontend) || [];
    },

    // Get upcoming
    async getUpcoming() {
        const response = await api.get<{ dramas: DramaFromApi[] }>('/dramas/upcoming');
        return response.data?.dramas.map(mapApiDramaToFrontend) || [];
    },

    // Get channels
    async getChannels() {
        const response = await api.get<{ channels: { id: number; name: string }[] }>('/dramas/channels');
        return response.data?.channels || [];
    },

    // Get genres
    async getGenres() {
        const response = await api.get<{ genres: { id: number; name: string }[] }>('/dramas/genres');
        return response.data?.genres || [];
    },

    // Get hero dramas
    async getHeroDramas() {
        const response = await api.get<{ dramas: DramaFromApi[] }>('/dramas/hero');
        return response.data?.dramas.map(mapApiDramaToFrontend) || [];
    },

    // Get recommended dramas (high rated 8.0+)
    async getRecommended(limit = 15) {
        const response = await api.get<{ dramas: DramaFromApi[]; pagination: any }>(`/dramas/top-rated?limit=${limit}`);
        return response.data?.dramas.map(mapApiDramaToFrontend) || [];
    },

    // Get featured airing dramas (Top 10)
    async getFeaturedAiring() {
        const response = await api.get<{ dramas: DramaFromApi[] }>('/dramas/featured-airing');
        return response.data?.dramas.map(mapApiDramaToFrontend) || [];
    },

    // Get consolidated homepage data
    async getHomepageData() {
        const response = await api.get<{
            heroDramas: DramaFromApi[];
            featuredAiring: DramaFromApi[];
            airingDramas: DramaFromApi[];
            upcomingDramas: DramaFromApi[];
            topRatedDramas: DramaFromApi[];
            recommendedDramas: DramaFromApi[];
        }>('/dramas/homepage');

        const data = response.data;
        if (!data) throw new Error('No homepage data available');

        return {
            heroDramas: data.heroDramas?.map(mapApiDramaToFrontend) || [],
            featuredAiring: data.featuredAiring?.map(mapApiDramaToFrontend) || [],
            airingDramas: data.airingDramas?.map(mapApiDramaToFrontend) || [],
            upcomingDramas: data.upcomingDramas?.map(mapApiDramaToFrontend) || [],
            topRatedDramas: data.topRatedDramas?.map(mapApiDramaToFrontend) || [],
            recommendedDramas: data.recommendedDramas?.map(mapApiDramaToFrontend) || []
        };
    },
};
