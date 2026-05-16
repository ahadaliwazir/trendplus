import { api, ApiResponse } from './api';

export interface UserProfile {
    id: number;
    username: string;
    avatar: string;
    bio: string;
    created_at?: string;
}

export interface SocialFriend {
    id: number;
    username: string;
    avatar: string;
    bio: string;
}

export interface FriendRequest {
    id: number;
    requester_id: number;
    addressee_id: number;
    status: 'pending' | 'accepted' | 'blocked';
    requester: {
        id: number;
        username: string;
        avatar: string;
    };
}

export interface Comment {
    id: number;
    user_id: number;
    drama_id: number;
    parent_id: number | null;
    content: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        image_url: string;
    };
    replies?: Comment[];
}

export interface UserList {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    is_public: boolean;
    dramas?: {
        id: number;
        title: string;
        image_url: string;
        slug?: string;
    }[];
    user?: {
        id: number;
        username: string;
        avatar: string;
    };
}

const socialService = {
    searchUsers: async (query: string): Promise<SocialFriend[]> => {
        const response = await api.get<SocialFriend[]>(`/users/search?query=${encodeURIComponent(query)}`);
        return response.data || [];
    },

    getUserProfile: async (username: string): Promise<{ user: UserProfile; dramaList: any[] }> => {
        const response = await api.get<{ user: UserProfile; dramaList: any[] }>(`/users/profile/${username}`);
        return response.data || { user: {} as UserProfile, dramaList: [] };
    },

    getFriends: async (): Promise<SocialFriend[]> => {
        const response = await api.get<SocialFriend[]>('/friendships/friends');
        return response.data || [];
    },

    getPendingRequests: async (): Promise<FriendRequest[]> => {
        const response = await api.get<FriendRequest[]>('/friendships/pending');
        return response.data || [];
    },

    sendFriendRequest: async (userId: number): Promise<any> => {
        const response = await api.post<any>(`/friendships/request/${userId}`, {});
        return response.data;
    },

    acceptFriendRequest: async (friendshipId: number): Promise<any> => {
        const response = await api.put<any>(`/friendships/accept/${friendshipId}`, {});
        return response.data;
    },

    removeFriendship: async (friendshipId: number): Promise<any> => {
        const response = await api.delete<any>(`/friendships/${friendshipId}`);
        return response.data;
    },

    // Comments
    getDramaComments: async (dramaId: number | string) => {
        const response = await api.get<Comment[]>(`/social/drama/${dramaId}/comments`);
        return response.data || [];
    },

    postComment: async (dramaId: number | string, content: string, parentId?: number) => {
        const response = await api.post<Comment>(`/social/drama/${dramaId}/comments`, {
            content,
            parentId
        });
        return response.data;
    },

    // User Lists
    createList: async (name: string, description?: string, is_public: boolean = true) => {
        const response = await api.post<UserList>('/social/lists', {
            name,
            description,
            is_public
        });
        return response.data;
    },

    getUserLists: async () => {
        const response = await api.get<UserList[]>('/social/lists/my');
        return response.data || [];
    },

    addDramaToList: async (listId: number, dramaId: number, notes?: string) => {
        return await api.post<{ success: boolean }>(`/social/lists/${listId}/drama/${dramaId}`, { notes });
    },

    removeDramaFromList: async (listId: number, dramaId: number) => {
        return await api.delete<{ success: boolean }>(`/social/lists/${listId}/drama/${dramaId}`);
    },

    getPublicList: async (listId: number) => {
        const response = await api.get<UserList>(`/social/lists/${listId}`);
        return response.data;
    }
};

export default socialService;
