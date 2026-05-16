import { api } from './api';
import { Drama } from '@/data/dramas';

export interface ReviewComment {
    id: number;
    user_id: number;
    review_id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        avatar: string;
    };
}

export interface UserReview {
    id: number;
    user_id: number;
    drama_id: number;
    title: string | null;
    content: string;
    rating: number;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    like_count?: number;
    comment_count?: number;
    is_liked?: boolean;
    user: {
        id: number;
        username: string;
        avatar: string;
    };
    drama?: {
        id: number;
        title: string;
        image_url: string;
        year: number;
        channel: {
            name: string;
        };
    };
}

export const reviewService = {
    // Get reviews for a drama
    async getDramaReviews(dramaId: number, page = 1) {
        const response = await api.get<{ reviews: UserReview[]; pagination: any }>(
            `/reviews/drama/${dramaId}?page=${page}`
        );
        return response.data || { reviews: [], pagination: {} };
    },

    // Get community feed
    async getFeed(page = 1) {
        const response = await api.get<{ reviews: UserReview[]; pagination: any }>(
            `/reviews/feed?page=${page}`
        );
        return response.data || { reviews: [], pagination: {} };
    },

    // Create a review
    async createReview(data: {
        drama_id: number;
        content: string;
        rating: number;
        title?: string;
    }) {
        const response = await api.post<{ review: UserReview }>('/reviews', data);
        return response.data.review;
    },

    // Toggle Like
    async toggleLike(reviewId: number) {
        const response = await api.post<{ success: true; message: string; liked: boolean }>(
            `/reviews/${reviewId}/like`,
            {}
        );
        return response.data;
    },

    // Add Comment
    async addComment(reviewId: number, content: string) {
        const response = await api.post<{ comment: ReviewComment }>(
            `/reviews/${reviewId}/comments`,
            { content }
        );
        return response.data?.comment;
    },

    // Get Comments
    async getComments(reviewId: number) {
        const response = await api.get<{ comments: ReviewComment[] }>(
            `/reviews/${reviewId}/comments`
        );
        return response.data?.comments || [];
    },

    // Get reviews by a specific user
    async getUserReviews(username: string) {
        const response = await api.get<{ reviews: UserReview[] }>(
            `/reviews/user/${username}`
        );
        return response.data?.reviews || [];
    },

    // Update a comment (owner only)
    async updateComment(commentId: number, content: string) {
        const response = await api.put<{ comment: ReviewComment }>(
            `/reviews/comments/${commentId}`,
            { content }
        );
        return response.data?.comment;
    },

    // Delete a comment (owner or admin)
    async deleteComment(commentId: number) {
        await api.delete(`/reviews/comments/${commentId}`);
    },

    // Update a review (owner only)
    async updateReview(reviewId: number, data: { content?: string; rating?: number; title?: string }) {
        const response = await api.put<{ review: UserReview }>(
            `/reviews/${reviewId}`,
            data
        );
        return response.data?.review;
    },

    // Delete a review (owner or admin)
    async deleteReview(reviewId: number) {
        await api.delete(`/reviews/${reviewId}`);
    }
};
