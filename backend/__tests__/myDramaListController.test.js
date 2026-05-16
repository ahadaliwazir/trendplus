/**
 * Unit Tests for MyDramaList Controller
 * Tests the share functionality for user drama lists
 */

const crypto = require('crypto');

// Mock the database models
jest.mock('../src/models', () => {
    const mockUser = {
        id: 1,
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        share_token: null,
        share_enabled: false,
        createdAt: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue(true)
    };

    const mockUserDrama = {
        id: 1,
        user_id: 1,
        drama_id: 1,
        status: 'completed',
        user_rating: 9,
        episodes_watched: 25,
        is_favorite: true,
        drama: {
            id: 1,
            title: 'Test Drama',
            poster: 'https://example.com/poster.jpg',
            year: 2024,
            rating: 8.5,
            episodes: 25,
            channel: { id: 1, name: 'Hum TV' },
            genres: [{ id: 1, name: 'Romance' }]
        }
    };

    return {
        User: {
            findByPk: jest.fn().mockResolvedValue({ ...mockUser }),
            findOne: jest.fn().mockResolvedValue(null)
        },
        UserDrama: {
            findAll: jest.fn().mockResolvedValue([mockUserDrama])
        },
        Drama: {},
        Channel: {},
        Genre: {},
        sequelize: {
            fn: jest.fn(),
            col: jest.fn()
        },
        Sequelize: {
            Op: {
                ne: Symbol('ne')
            }
        }
    };
});

// Import controller after mocks
const myDramaListController = require('../src/controllers/myDramaListController');

describe('MyDramaList Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            user: { id: 1 },
            params: {},
            body: {}
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getShareSettings', () => {
        it('should return share settings for authenticated user', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue({
                id: 1,
                username: 'testuser',
                share_token: 'abc123',
                share_enabled: true
            });

            await myDramaListController.getShareSettings(mockReq, mockRes, mockNext);

            expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    share_token: 'abc123',
                    share_enabled: true,
                    share_url: expect.stringContaining('/list/abc123')
                })
            }));
        });

        it('should return 404 if user not found', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(null);

            await myDramaListController.getShareSettings(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'User not found'
            }));
        });

        it('should return null share_url if no token exists', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue({
                id: 1,
                username: 'testuser',
                share_token: null,
                share_enabled: false
            });

            await myDramaListController.getShareSettings(mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    share_token: null,
                    share_enabled: false,
                    share_url: null
                })
            }));
        });
    });

    describe('generateShareLink', () => {
        it('should generate a new share token', async () => {
            const mockUser = {
                id: 1,
                share_token: null,
                share_enabled: false,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            User.findOne.mockResolvedValue(null); // Token is unique

            await myDramaListController.generateShareLink(mockReq, mockRes, mockNext);

            expect(mockUser.save).toHaveBeenCalled();
            expect(mockUser.share_enabled).toBe(true);
            expect(mockUser.share_token).toBeDefined();
            expect(mockUser.share_token.length).toBe(32); // 16 bytes = 32 hex chars
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Share link generated successfully',
                data: expect.objectContaining({
                    share_token: expect.any(String),
                    share_enabled: true,
                    share_url: expect.stringContaining('/list/')
                })
            }));
        });

        it('should regenerate token if user already has one', async () => {
            const mockUser = {
                id: 1,
                share_token: 'old_token',
                share_enabled: true,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            User.findOne.mockResolvedValue(null);

            await myDramaListController.generateShareLink(mockReq, mockRes, mockNext);

            expect(mockUser.share_token).not.toBe('old_token');
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(null);

            await myDramaListController.generateShareLink(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('toggleSharing', () => {
        it('should enable sharing', async () => {
            const mockUser = {
                id: 1,
                share_token: 'existing_token',
                share_enabled: false,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.body = { enabled: true };

            await myDramaListController.toggleSharing(mockReq, mockRes, mockNext);

            expect(mockUser.share_enabled).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Sharing enabled'
            }));
        });

        it('should disable sharing', async () => {
            const mockUser = {
                id: 1,
                share_token: 'existing_token',
                share_enabled: true,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            mockReq.body = { enabled: false };

            await myDramaListController.toggleSharing(mockReq, mockRes, mockNext);

            expect(mockUser.share_enabled).toBe(false);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Sharing disabled'
            }));
        });

        it('should generate token if enabling without existing token', async () => {
            const mockUser = {
                id: 1,
                share_token: null,
                share_enabled: false,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            User.findOne.mockResolvedValue(null);
            mockReq.body = { enabled: true };

            await myDramaListController.toggleSharing(mockReq, mockRes, mockNext);

            expect(mockUser.share_token).toBeDefined();
            expect(mockUser.share_token.length).toBe(32);
            expect(mockUser.share_enabled).toBe(true);
        });
    });

    describe('getPublicList', () => {
        it('should return public list for valid token', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                avatar: 'https://example.com/avatar.jpg',
                bio: 'Test bio',
                createdAt: new Date('2024-01-01')
            };
            const mockDramaList = [{
                status: 'completed',
                user_rating: 9,
                is_favorite: true,
                drama: {
                    id: 1,
                    title: 'Test Drama',
                    poster: 'https://example.com/poster.jpg',
                    year: 2024,
                    rating: 8.5,
                    episodes: 25,
                    channel: { name: 'Hum TV' },
                    genres: [{ name: 'Romance' }]
                }
            }];

            const { User, UserDrama } = require('../src/models');
            User.findOne.mockResolvedValue(mockUser);
            UserDrama.findAll.mockResolvedValue(mockDramaList);
            mockReq.params = { token: 'valid_token' };

            await myDramaListController.getPublicList(mockReq, mockRes, mockNext);

            expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    share_token: 'valid_token',
                    share_enabled: true
                })
            }));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    user: expect.objectContaining({
                        username: 'testuser'
                    }),
                    stats: expect.objectContaining({
                        total: 1,
                        completed: 1,
                        favorites: 1
                    }),
                    list: expect.objectContaining({
                        completed: expect.any(Array)
                    })
                })
            }));
        });

        it('should return 404 for invalid or disabled token', async () => {
            const { User } = require('../src/models');
            User.findOne.mockResolvedValue(null);
            mockReq.params = { token: 'invalid_token' };

            await myDramaListController.getPublicList(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'List not found or sharing is disabled'
            }));
        });

        it('should calculate stats correctly', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                avatar: 'avatar.jpg',
                bio: 'bio',
                createdAt: new Date()
            };
            const mockDramaList = [
                { status: 'completed', user_rating: 10, is_favorite: true, drama: { episodes: 20, channel: {}, genres: [] } },
                { status: 'completed', user_rating: 8, is_favorite: false, drama: { episodes: 15, channel: {}, genres: [] } },
                { status: 'watching', user_rating: null, is_favorite: true, drama: { episodes: 25, channel: {}, genres: [] } },
                { status: 'plan_to_watch', user_rating: null, is_favorite: false, drama: { episodes: 10, channel: {}, genres: [] } }
            ];

            const { User, UserDrama } = require('../src/models');
            User.findOne.mockResolvedValue(mockUser);
            UserDrama.findAll.mockResolvedValue(mockDramaList);
            mockReq.params = { token: 'valid_token' };

            await myDramaListController.getPublicList(mockReq, mockRes, mockNext);

            const response = mockRes.json.mock.calls[0][0];
            expect(response.data.stats.total).toBe(4);
            expect(response.data.stats.completed).toBe(2);
            expect(response.data.stats.watching).toBe(1);
            expect(response.data.stats.plan_to_watch).toBe(1);
            expect(response.data.stats.favorites).toBe(2);
            expect(parseFloat(response.data.stats.mean_score)).toBe(9.0); // (10+8)/2
            expect(response.data.stats.total_episodes).toBe(35); // 20+15 from completed
        });
    });
});

describe('Token Generation', () => {
    it('should generate 32-character hex tokens', () => {
        const token = crypto.randomBytes(16).toString('hex');
        expect(token.length).toBe(32);
        expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
        const tokens = new Set();
        for (let i = 0; i < 100; i++) {
            tokens.add(crypto.randomBytes(16).toString('hex'));
        }
        expect(tokens.size).toBe(100);
    });
});
