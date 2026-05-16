-- ============================================
-- DramaList Pakistan - DEFINITIVE Database Schema (PostgreSQL)
-- Matches Sequelize models exactly for full data migration
-- ============================================

-- Clean up existing tables
DROP VIEW IF EXISTS v_user_stats CASCADE;
DROP VIEW IF EXISTS v_top_rated_dramas CASCADE;
DROP TABLE IF EXISTS review_comments CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS user_votes CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_reviews CASCADE;
DROP TABLE IF EXISTS user_dramas CASCADE;
DROP TABLE IF EXISTS drama_cast CASCADE;
DROP TABLE IF EXISTS cast_members CASCADE;
DROP TABLE IF EXISTS drama_genres CASCADE;
DROP TABLE IF EXISTS dramas CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS drama_status CASCADE;
DROP TYPE IF EXISTS watch_status CASCADE;
DROP TYPE IF EXISTS news_category CASCADE;
DROP TYPE IF EXISTS friendship_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ============================================
-- TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE drama_status AS ENUM ('airing', 'completed', 'upcoming');
CREATE TYPE watch_status AS ENUM ('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped');
CREATE TYPE news_category AS ENUM ('announcement', 'cast_news', 'awards', 'industry', 'review', 'other');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE notification_type AS ENUM ('profanity_warning', 'user_blocked', 'report', 'other');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    role user_role NOT NULL DEFAULT 'user',
    warning_count INTEGER DEFAULT 0 NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ban_count INTEGER DEFAULT 0 NOT NULL,
    reset_token VARCHAR(64) DEFAULT NULL,
    reset_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    share_token VARCHAR(64) DEFAULT NULL UNIQUE,
    share_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    has_completed_onboarding BOOLEAN DEFAULT FALSE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_otp VARCHAR(6) DEFAULT NULL,
    verification_otp_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHANNELS TABLE
-- ============================================
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- GENRES TABLE
-- ============================================
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DRAMAS TABLE
-- ============================================
CREATE TABLE dramas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(191) DEFAULT NULL UNIQUE,
    year INTEGER NOT NULL,
    imdb_rating DECIMAL(3,1) DEFAULT 0.0,
    site_rating DECIMAL(3,1) DEFAULT 0.0,
    episodes INTEGER NOT NULL DEFAULT 1,
    current_episode INTEGER DEFAULT NULL,
    status drama_status NOT NULL DEFAULT 'upcoming',
    channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    synopsis TEXT DEFAULT NULL,
    image_url VARCHAR(1500) DEFAULT NULL,
    vote_count VARCHAR(20) DEFAULT '0',
    trailer_url VARCHAR(1500) DEFAULT NULL,
    cast_names TEXT DEFAULT NULL,
    is_hero BOOLEAN DEFAULT FALSE,
    hero_image_url VARCHAR(1500) DEFAULT NULL,
    hero_pos_x INTEGER DEFAULT 50,
    hero_pos_y INTEGER DEFAULT 10,
    hero_scale DECIMAL(3,2) DEFAULT 1.0,
    feature_rank INTEGER DEFAULT NULL,
    site_vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DRAMA_GENRES TABLE
-- ============================================
CREATE TABLE drama_genres (
    drama_id INTEGER NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (drama_id, genre_id)
);

-- ============================================
-- CAST_MEMBERS TABLE
-- ============================================
CREATE TABLE cast_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    birth_place VARCHAR(200) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DRAMA_CAST TABLE
-- ============================================
CREATE TABLE drama_cast (
    drama_id INTEGER NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
    cast_id INTEGER NOT NULL REFERENCES cast_members(id) ON DELETE CASCADE,
    role_name VARCHAR(100) DEFAULT NULL,
    is_lead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (drama_id, cast_id)
);

-- ============================================
-- USER_DRAMAS TABLE
-- ============================================
CREATE TABLE user_dramas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drama_id INTEGER NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
    status watch_status NOT NULL DEFAULT 'plan_to_watch',
    user_rating SMALLINT DEFAULT NULL CHECK (user_rating >= 1 AND user_rating <= 10),
    episodes_watched INTEGER DEFAULT 0,
    review TEXT DEFAULT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    date_started DATE DEFAULT NULL,
    date_completed DATE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, drama_id)
);

-- ============================================
-- USER_REVIEWS TABLE
-- ============================================
CREATE TABLE user_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drama_id INTEGER NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
    title VARCHAR(200) DEFAULT NULL,
    content TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, drama_id)
);

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NEWS TABLE
-- ============================================
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(500) DEFAULT NULL,
    image_url VARCHAR(1500) DEFAULT NULL,
    category news_category NOT NULL DEFAULT 'other',
    source_url VARCHAR(1500) DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER_VOTES TABLE
-- ============================================
CREATE TABLE user_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drama_id INTEGER NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, drama_id)
);

-- ============================================
-- FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (requester_id, addressee_id)
);

-- ============================================
-- ADMIN_NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE admin_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    context TEXT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REVIEW LIKES & COMMENTS
-- ============================================
CREATE TABLE review_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER NOT NULL REFERENCES user_reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, review_id)
);

CREATE TABLE review_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER NOT NULL REFERENCES user_reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_top_rated_dramas AS
SELECT 
    d.*,
    c.name AS channel_name,
    string_agg(DISTINCT g.name, ', ' ORDER BY g.name) AS genres,
    COUNT(DISTINCT ud.id) AS total_users,
    AVG(ud.user_rating) AS avg_user_rating
FROM dramas d
JOIN channels c ON d.channel_id = c.id
LEFT JOIN drama_genres dg ON d.id = dg.drama_id
LEFT JOIN genres g ON dg.genre_id = g.id
LEFT JOIN user_dramas ud ON d.id = ud.drama_id
GROUP BY d.id, c.name;

CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    u.id AS user_id,
    u.username,
    COUNT(DISTINCT ud.drama_id) AS total_dramas,
    SUM(CASE WHEN ud.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN ud.status = 'watching' THEN 1 ELSE 0 END) AS watching_count,
    SUM(CASE WHEN ud.status = 'plan_to_watch' THEN 1 ELSE 0 END) AS plan_to_watch_count,
    ROUND(AVG(ud.user_rating), 1) AS mean_score,
    SUM(ud.episodes_watched) AS total_episodes
FROM users u
LEFT JOIN user_dramas ud ON u.id = ud.user_id
GROUP BY u.id;

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_genres_updated_at BEFORE UPDATE ON genres FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dramas_updated_at BEFORE UPDATE ON dramas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drama_genres_updated_at BEFORE UPDATE ON drama_genres FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cast_members_updated_at BEFORE UPDATE ON cast_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drama_cast_updated_at BEFORE UPDATE ON drama_cast FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_dramas_updated_at BEFORE UPDATE ON user_dramas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_votes_updated_at BEFORE UPDATE ON user_votes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_notifications_updated_at BEFORE UPDATE ON admin_notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_review_likes_updated_at BEFORE UPDATE ON review_likes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_review_comments_updated_at BEFORE UPDATE ON review_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
