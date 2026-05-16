-- ============================================
-- DramaList Pakistan - Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS dramalist_pk 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE dramalist_pk;

-- ============================================
-- USERS TABLE
-- Stores user accounts and profile information
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- Store hashed passwords (use PHP password_hash())
    avatar VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- ============================================
-- CHANNELS TABLE
-- TV channels that air dramas
-- ============================================
CREATE TABLE channels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- GENRES TABLE
-- Drama genres (Romance, Drama, Thriller, etc.)
-- ============================================
CREATE TABLE genres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- DRAMAS TABLE
-- Main drama information
-- ============================================
CREATE TABLE dramas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    imdb_rating DECIMAL(3,1) DEFAULT 0.0,
    episodes INT NOT NULL DEFAULT 1,
    status ENUM('airing', 'completed', 'upcoming') NOT NULL DEFAULT 'upcoming',
    channel_id INT NOT NULL,
    synopsis TEXT,
    image_url VARCHAR(500),
    vote_count VARCHAR(20) DEFAULT NULL,
    trailer_url VARCHAR(500) DEFAULT NULL,
    cast_names TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_year (year),
    INDEX idx_status (status),
    INDEX idx_rating (imdb_rating DESC)
) ENGINE=InnoDB;

-- ============================================
-- DRAMA_GENRES TABLE
-- Many-to-many relationship between dramas and genres
-- ============================================
CREATE TABLE drama_genres (
    drama_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (drama_id, genre_id),
    FOREIGN KEY (drama_id) REFERENCES dramas(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CAST_MEMBERS TABLE
-- Actors/actresses in dramas
-- ============================================
CREATE TABLE cast_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- ============================================
-- DRAMA_CAST TABLE
-- Many-to-many relationship between dramas and cast
-- ============================================
CREATE TABLE drama_cast (
    drama_id INT NOT NULL,
    cast_id INT NOT NULL,
    role_name VARCHAR(100) DEFAULT NULL,
    is_lead BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (drama_id, cast_id),
    FOREIGN KEY (drama_id) REFERENCES dramas(id) ON DELETE CASCADE,
    FOREIGN KEY (cast_id) REFERENCES cast_members(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- USER_DRAMAS TABLE
-- User's drama list with status, rating, reviews
-- This is the main tracking table
-- ============================================
CREATE TABLE user_dramas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    drama_id INT NOT NULL,
    status ENUM('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped') NOT NULL DEFAULT 'plan_to_watch',
    user_rating TINYINT UNSIGNED DEFAULT NULL CHECK (user_rating >= 1 AND user_rating <= 10),
    episodes_watched INT DEFAULT 0,
    review TEXT DEFAULT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    date_started DATE DEFAULT NULL,
    date_completed DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_drama (user_id, drama_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (drama_id) REFERENCES dramas(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_rating (user_id, user_rating DESC)
) ENGINE=InnoDB;

-- ============================================
-- USER_REVIEWS TABLE
-- Detailed reviews with helpful votes
-- ============================================
CREATE TABLE user_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    drama_id INT NOT NULL,
    title VARCHAR(200) DEFAULT NULL,
    content TEXT NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 10),
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_review (user_id, drama_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (drama_id) REFERENCES dramas(id) ON DELETE CASCADE,
    INDEX idx_drama_reviews (drama_id, helpful_count DESC)
) ENGINE=InnoDB;

-- ============================================
-- USER_SESSIONS TABLE (Optional - for token-based auth)
-- ============================================
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Top rated dramas
CREATE VIEW v_top_rated_dramas AS
SELECT 
    d.*,
    c.name AS channel_name,
    GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres,
    COUNT(DISTINCT ud.id) AS total_users,
    AVG(ud.user_rating) AS avg_user_rating
FROM dramas d
JOIN channels c ON d.channel_id = c.id
LEFT JOIN drama_genres dg ON d.id = dg.drama_id
LEFT JOIN genres g ON dg.genre_id = g.id
LEFT JOIN user_dramas ud ON d.id = ud.drama_id
GROUP BY d.id
ORDER BY d.imdb_rating DESC;

-- View: User statistics
CREATE VIEW v_user_stats AS
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
