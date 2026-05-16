import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const episodeService = {
    // Get all episodes for a drama
    getByDramaId: async (dramaId: number) => {
        const response = await axios.get(`${API_URL}/episodes/${dramaId}`);
        return response.data;
    },

    // Create a new episode
    create: async (data: any) => {
        const response = await axios.post(`${API_URL}/episodes`, data);
        return response.data;
    },

    // Update an episode
    update: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/episodes/${id}`, data);
        return response.data;
    },

    // Delete an episode
    delete: async (id: number) => {
        const response = await axios.delete(`${API_URL}/episodes/${id}`);
        return response.data;
    }
};
