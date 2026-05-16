/**
 * Integration Tests for MyDramaList API Endpoints
 * Tests the full request/response cycle using supertest
 */

const request = require('supertest');
const express = require('express');

// Create a minimal test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req, res, next) => {
        req.user = { id: 1 };
        next();
    });

    // Mount the routes
    const myDramaListRoutes = require('../src/routes/myDramaListRoutes');
    app.use('/api/my-list', myDramaListRoutes);

    // Error handler
    app.use((err, req, res, next) => {
        res.status(500).json({ success: false, message: err.message });
    });

    return app;
};

// Mock the models
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

    return {
        User: {
            findByPk: jest.fn().mockResolvedValue({ ...mockUser, save: jest.fn().mockResolvedValue(true) }),
            findOne: jest.fn().mockResolvedValue(null)
        },
        UserDrama: {
            findAll: jest.fn().mockResolvedValue([])
        },
        Drama: {},
        Channel: {},
        Genre: {},
        sequelize: { fn: jest.fn(), col: jest.fn() },
        Sequelize: { Op: { ne: Symbol('ne') } }
    };
});

describe('MyDramaList API Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
        jest.clearAllMocks();
    });

    describe('GET /api/my-list/settings', () => {
        it('should return 200 with share settings', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue({
                id: 1,
                username: 'testuser',
                share_token: 'abc123',
                share_enabled: true
            });

            const response = await request(app)
                .get('/api/my-list/settings')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('share_token');
            expect(response.body.data).toHaveProperty('share_enabled');
            expect(response.body.data).toHaveProperty('share_url');
        });

        it('should return 404 when user not found', async () => {
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/my-list/settings')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/my-list/generate', () => {
        it('should generate a new share link', async () => {
            const mockUser = {
                id: 1,
                share_token: null,
                share_enabled: false,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/my-list/generate')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('generated');
            expect(response.body.data.share_token).toBeDefined();
            expect(response.body.data.share_enabled).toBe(true);
        });
    });

    describe('PUT /api/my-list/toggle', () => {
        it('should enable sharing', async () => {
            const mockUser = {
                id: 1,
                share_token: 'existing',
                share_enabled: false,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .put('/api/my-list/toggle')
                .send({ enabled: true })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('enabled');
        });

        it('should disable sharing', async () => {
            const mockUser = {
                id: 1,
                share_token: 'existing',
                share_enabled: true,
                save: jest.fn().mockResolvedValue(true)
            };
            const { User } = require('../src/models');
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .put('/api/my-list/toggle')
                .send({ enabled: false })
                .expect(200);

            expect(response.body.message).toContain('disabled');
        });
    });

    describe('GET /api/my-list/public/:token', () => {
        it('should return public list for valid token', async () => {
            const { User, UserDrama } = require('../src/models');
            User.findOne.mockResolvedValue({
                id: 1,
                username: 'testuser',
                avatar: 'avatar.jpg',
                bio: 'bio',
                createdAt: new Date()
            });
            UserDrama.findAll.mockResolvedValue([
                {
                    status: 'completed',
                    user_rating: 9,
                    is_favorite: true,
                    drama: {
                        id: 1,
                        title: 'Drama 1',
                        poster: 'poster.jpg',
                        year: 2024,
                        rating: 8.5,
                        episodes: 25,
                        channel: { name: 'Hum TV' },
                        genres: [{ name: 'Romance' }]
                    }
                }
            ]);

            const response = await request(app)
                .get('/api/my-list/public/validtoken123')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.stats).toBeDefined();
            expect(response.body.data.list).toBeDefined();
        });

        it('should return 404 for invalid token', async () => {
            const { User } = require('../src/models');
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/my-list/public/invalidtoken')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });
    });
});

describe('API Response Format', () => {
    let app;

    beforeEach(() => {
        app = createTestApp();
    });

    it('should always return JSON', async () => {
        const { User } = require('../src/models');
        User.findByPk.mockResolvedValue({
            id: 1,
            share_token: null,
            share_enabled: false
        });

        const response = await request(app).get('/api/my-list/settings');
        expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include success field in all responses', async () => {
        const { User } = require('../src/models');
        User.findByPk.mockResolvedValue({
            id: 1,
            share_token: 'token',
            share_enabled: true
        });

        const response = await request(app).get('/api/my-list/settings');
        expect(response.body).toHaveProperty('success');
    });
});
