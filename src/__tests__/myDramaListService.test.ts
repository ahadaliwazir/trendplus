/**
 * Tests for myDramaListService
 * Tests the frontend service layer for MyDramaList functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import myDramaListService from '../services/myDramaListService';
import { api } from '../services/api';

// Mock the api module
vi.mock('../services/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('myDramaListService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getShareSettings', () => {
        it('should fetch share settings from the API', async () => {
            const mockSettings = {
                share_token: 'abc123',
                share_enabled: true,
                share_url: 'http://localhost/list/abc123'
            };
            (api.get as any).mockResolvedValue({ data: mockSettings });

            const result = await myDramaListService.getShareSettings();

            expect(api.get).toHaveBeenCalledWith('/my-list/settings');
            expect(result).toEqual(mockSettings);
        });

        it('should return defaults when API returns null', async () => {
            (api.get as any).mockResolvedValue({ data: null });

            const result = await myDramaListService.getShareSettings();

            expect(result).toEqual({
                share_token: null,
                share_enabled: false,
                share_url: null
            });
        });
    });

    describe('generateShareLink', () => {
        it('should call POST to generate a new share link', async () => {
            const mockSettings = {
                share_token: 'newtoken123',
                share_enabled: true,
                share_url: 'http://localhost/list/newtoken123'
            };
            (api.post as any).mockResolvedValue({ data: mockSettings });

            const result = await myDramaListService.generateShareLink();

            expect(api.post).toHaveBeenCalledWith('/my-list/generate', {});
            expect(result).toEqual(mockSettings);
        });
    });

    describe('toggleSharing', () => {
        it('should enable sharing', async () => {
            const mockSettings = {
                share_token: 'token123',
                share_enabled: true,
                share_url: 'http://localhost/list/token123'
            };
            (api.put as any).mockResolvedValue({ data: mockSettings });

            const result = await myDramaListService.toggleSharing(true);

            expect(api.put).toHaveBeenCalledWith('/my-list/toggle', { enabled: true });
            expect(result.share_enabled).toBe(true);
        });

        it('should disable sharing', async () => {
            const mockSettings = {
                share_token: 'token123',
                share_enabled: false,
                share_url: null
            };
            (api.put as any).mockResolvedValue({ data: mockSettings });

            const result = await myDramaListService.toggleSharing(false);

            expect(api.put).toHaveBeenCalledWith('/my-list/toggle', { enabled: false });
            expect(result.share_enabled).toBe(false);
        });
    });

    describe('getPublicList', () => {
        it('should fetch public list data', async () => {
            const mockData = {
                user: {
                    username: 'testuser',
                    avatar: 'avatar.jpg',
                    bio: 'Test bio',
                    member_since: '2024-01-01'
                },
                stats: {
                    total: 10,
                    watching: 2,
                    completed: 5,
                    plan_to_watch: 3,
                    on_hold: 0,
                    dropped: 0,
                    mean_score: '8.5',
                    total_episodes: 150,
                    days_watched: '4.7',
                    favorites: 2
                },
                list: {
                    watching: [],
                    completed: [],
                    plan_to_watch: [],
                    on_hold: [],
                    dropped: []
                }
            };
            (api.get as any).mockResolvedValue({ data: mockData });

            const result = await myDramaListService.getPublicList('validtoken');

            expect(api.get).toHaveBeenCalledWith('/my-list/public/validtoken');
            expect(result).toEqual(mockData);
        });

        it('should throw error for invalid token', async () => {
            (api.get as any).mockRejectedValue(new Error('Not found'));

            await expect(myDramaListService.getPublicList('invalidtoken')).rejects.toThrow();
        });
    });
});

describe('ShareSettings interface', () => {
    it('should have correct structure', () => {
        const settings = {
            share_token: 'token',
            share_enabled: true,
            share_url: 'http://example.com/list/token'
        };

        expect(settings).toHaveProperty('share_token');
        expect(settings).toHaveProperty('share_enabled');
        expect(settings).toHaveProperty('share_url');
        expect(typeof settings.share_enabled).toBe('boolean');
    });
});

describe('PublicDramaItem interface', () => {
    it('should have all required fields', () => {
        const drama = {
            id: 1,
            title: 'Test Drama',
            poster: 'poster.jpg',
            year: 2024,
            rating: 8.5,
            user_rating: 9,
            episodes_watched: 20,
            total_episodes: 25,
            is_favorite: true,
            channel: 'Hum TV',
            genres: ['Romance', 'Drama']
        };

        expect(drama).toHaveProperty('id');
        expect(drama).toHaveProperty('title');
        expect(drama).toHaveProperty('poster');
        expect(drama).toHaveProperty('year');
        expect(Array.isArray(drama.genres)).toBe(true);
    });
});
