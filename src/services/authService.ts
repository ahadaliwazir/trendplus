import { api } from './api';

// Types
export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    role: 'user' | 'admin';
    created_at: string;
    has_completed_onboarding: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface SignupResponse {
    requires_verification?: boolean;
    email?: string;
    message?: string;
    data?: AuthResponse;
}

// Auth Service
export const authService = {
    // Signup - now returns verification status
    async signup(username: string, email: string, password: string): Promise<SignupResponse> {
        const response = await api.post<any>('/auth/signup', {
            username,
            email,
            password,
        });

        console.log('Raw signup response:', response);

        // Backend returns: { success, requires_verification, email } OR { success, data: { user, token } }
        // The api.post wrapper returns this directly

        // Check for verification flow (new)
        if (response.requires_verification) {
            return {
                requires_verification: true,
                email: response.email
            };
        }

        // Old flow - had token
        if (response.data?.token) {
            localStorage.setItem('dramalist_token', response.data.token);
        }

        return response;
    },

    // Login
    async login(email: string, password: string) {
        const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        if (response.data?.token) {
            localStorage.setItem('dramalist_token', response.data.token);
        }

        return response;
    },

    // Get current user
    async getMe() {
        const response = await api.get<{ user: User }>('/auth/me');
        return response.data?.user;
    },

    // Update profile
    async updateProfile(data: { avatar?: string; bio?: string }) {
        const response = await api.put<{ user: User }>('/auth/profile', data);
        return response.data?.user;
    },

    // Change password
    async changePassword(currentPassword: string, newPassword: string) {
        return api.put('/auth/password', { currentPassword, newPassword });
    },

    // Complete onboarding
    async completeOnboarding() {
        const response = await api.put<{ user: User }>('/auth/complete-onboarding', {});
        return response.data?.user;
    },

    // Logout
    logout() {
        localStorage.removeItem('dramalist_token');
    },

    // Check if logged in
    isAuthenticated() {
        return !!localStorage.getItem('dramalist_token');
    },
};
