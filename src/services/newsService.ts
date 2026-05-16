import { api } from './api';

export interface News {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    image_url: string;
    category: 'announcement' | 'cast_news' | 'awards' | 'industry' | 'review' | 'other';
    source_url: string;
    is_featured: boolean;
    views: number;
    created_at: string;
    updated_at: string;
}

interface NewsResponse {
    news: News[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export const newsService = {
    async getAll(params: { category?: string; featured?: boolean; page?: number; limit?: number } = {}) {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.featured) queryParams.append('featured', 'true');
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/news?${queryString}` : '/news';
        const response = await api.get<NewsResponse>(endpoint);
        return response.data;
    },

    async getById(id: number) {
        const response = await api.get<{ news: News }>(`/news/${id}`);
        return response.data?.news;
    },

    async create(data: Partial<News>) {
        const response = await api.post<{ news: News }>('/news', data);
        return response.data?.news;
    },

    async update(id: number, data: Partial<News>) {
        const response = await api.put<{ news: News }>(`/news/${id}`, data);
        return response.data?.news;
    },

    async delete(id: number) {
        await api.delete(`/news/${id}`);
    }
};
