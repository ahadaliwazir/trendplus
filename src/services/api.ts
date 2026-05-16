// API Configuration and Base Service
// API Configuration and Base Service
const API_BASE_URL = (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('onrender')) 
    ? import.meta.env.VITE_API_URL 
    : '/api';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: { field: string; message: string }[];
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem('dramalist_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'An error occurred',
                    errors: data.errors,
                    force_logout: data.force_logout,
                    warning_count: data.warning_count,
                    ban_type: data.ban_type,
                };
            }

            return data;
        } catch (error: any) {
            if (error.status) {
                throw error;
            }
            throw {
                status: 500,
                message: 'Network error. Please check your connection.',
            };
        }
    }

    // GET request
    get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST request
    post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    // PUT request
    put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    // DELETE request
    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService(API_BASE_URL);
export type { ApiResponse };
