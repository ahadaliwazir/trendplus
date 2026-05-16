import { api } from './api';

export interface VoteData {
    rating: number;
    type: 'vote' | 'review';
}

export interface VoteStats {
    averageRating: number;
    totalVotes: number;
    voteCount: number;
    reviewCount: number;
    breakdown: {
        votes: { average: number; count: number };
        reviews: { average: number; count: number };
    };
}

export const voteService = {
    // Submit or update a vote for a drama
    async submitVote(dramaId: number, rating: number): Promise<void> {
        await api.post(`/votes/${dramaId}`, { rating });
    },

    // Get current user's vote for a drama
    async getMyVote(dramaId: number): Promise<{
        vote: VoteData | null;
        review: VoteData | null;
        effectiveRating: number | null;
    }> {
        const response = await api.get<{
            data: {
                vote: VoteData | null;
                review: VoteData | null;
                effectiveRating: number | null;
            };
        }>(`/votes/${dramaId}/my-vote`);
        return response.data?.data || { vote: null, review: null, effectiveRating: null };
    },

    // Get voting stats for a drama
    async getVoteStats(dramaId: number): Promise<VoteStats> {
        const response = await api.get<{ data: VoteStats }>(`/votes/${dramaId}/stats`);
        return response.data?.data || {
            averageRating: 0,
            totalVotes: 0,
            voteCount: 0,
            reviewCount: 0,
            breakdown: {
                votes: { average: 0, count: 0 },
                reviews: { average: 0, count: 0 }
            }
        };
    },

    // Delete user's vote
    async deleteVote(dramaId: number): Promise<void> {
        await api.delete(`/votes/${dramaId}`);
    }
};
