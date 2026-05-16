-- ============================================
-- DramaList Pakistan - Seed Data
-- Run this AFTER schema.sql
-- ============================================

USE dramalist_pk;

-- ============================================
-- SEED: Channels
-- ============================================
INSERT INTO channels (id, name, logo_url) VALUES
(1, 'Geo Entertainment', 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Geo_Entertainment_Logo.svg/200px-Geo_Entertainment_Logo.svg.png'),
(2, 'ARY Digital', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ARY_Digital_Logo.svg/200px-ARY_Digital_Logo.svg.png'),
(3, 'Hum TV', 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Hum_TV_Logo.svg/200px-Hum_TV_Logo.svg.png'),
(4, 'Express Entertainment', 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Express_Entertainment_Logo.svg/200px-Express_Entertainment_Logo.svg.png'),
(5, 'A-Plus Entertainment', NULL);

-- ============================================
-- SEED: Genres
-- ============================================
INSERT INTO genres (id, name) VALUES
(1, 'Romance'),
(2, 'Drama'),
(3, 'Family'),
(4, 'Thriller'),
(5, 'Comedy'),
(6, 'Social'),
(7, 'Mystery'),
(8, 'Action'),
(9, 'Historical'),
(10, 'Tragedy');

-- ============================================
-- SEED: Dramas
-- ============================================
INSERT INTO dramas (id, title, year, imdb_rating, episodes, status, channel_id, synopsis, image_url) VALUES
(1, 'Tere Bin', 2023, 7.4, 58, 'completed', 1, 
   'A tale of love, family traditions, and the clash between modern and traditional values in Pakistani society. The drama follows Murtasim and Meerab through their journey of arranged marriage to finding true love.',
   'https://m.media-amazon.com/images/M/MV5BZWQ5MjY3OTctNzUyZi00ZWFiLWI4YTUtYzRiYTE4MDFmODllXkEyXkFqcGc@._V1_.jpg'),

(2, 'Mere Humsafar', 2022, 8.2, 40, 'completed', 2,
   'A beautiful love story that explores the complexities of relationships within joint family systems. Hala, an orphaned girl, finds herself in a difficult household but discovers love with Hamza.',
   'https://m.media-amazon.com/images/M/MV5BYTljYmE1NmItZDg0Ny00OTIwLTgwMWEtZjgxNDYyMjIzZDIzXkEyXkFqcGc@._V1_.jpg'),

(3, 'Khaani', 2018, 7.7, 31, 'completed', 1,
   'A gripping story of a strong woman seeking justice after her twin brother''s murder by Mir Hadi, the powerful and spoiled son of a politician. Inspired by real events, it explores themes of power, class, and redemption.',
   'https://m.media-amazon.com/images/M/MV5BM2ZjMjE4OWQtMjFjNi00ZWY2LWJjMGMtNjBiNzM5NTFhMzE5XkEyXkFqcGc@._V1_.jpg'),

(4, 'Parizaad', 2021, 9.1, 29, 'completed', 3,
   'The extraordinary journey of an ordinary man with a golden heart, facing society''s prejudices about appearance. Based on Hashim Nadeem''s novel, Parizaad''s life takes unexpected turns as he meets remarkable people.',
   'https://m.media-amazon.com/images/M/MV5BN2U0OGFjMzEtNmM0ZC00NzliLTk4MjYtNGQ1NWU3YzQxNzIyXkEyXkFqcGc@._V1_.jpg'),

(5, 'Humsafar', 2011, 8.9, 23, 'completed', 3,
   'A timeless love story that became a cultural phenomenon across South Asia. Khirad and Ashar''s relationship faces tests of trust, family interference, and misunderstandings in this iconic drama.',
   'https://m.media-amazon.com/images/M/MV5BMzNlY2EyMGItNGUyNS00YzA4LTg4ZjUtNWUzNGVlNzUyNmE0XkEyXkFqcGc@._V1_.jpg'),

(6, 'Ishq Murshid', 2024, 8.2, 30, 'completed', 3,
   'A mystical love story intertwining fate, spirituality, and the journey of self-discovery. When Shibra''s life takes an unexpected turn, she meets Murshid—a man shrouded in mystery, and their paths become forever intertwined.',
   'https://m.media-amazon.com/images/M/MV5BMzY2ZTc5YzYtOThhMC00ODZmLWI5MWUtOGMyODVmYzVjNmQzXkEyXkFqcGc@._V1_.jpg'),

(7, 'Kabhi Main Kabhi Tum', 2024, 9.0, 34, 'completed', 2,
   'Two opposite personalities—Mustafa, a carefree soul, and Sharjeena, a determined woman—find love in the most unexpected circumstances. A modern romantic comedy that won hearts across Pakistan.',
   'https://m.media-amazon.com/images/M/MV5BZWJjY2NmMmYtOTZmNC00OTNhLWI1ZGEtZjlkYTY1MDU1OTM1XkEyXkFqcGc@._V1_.jpg'),

(8, 'Mujhe Pyaar Hua Tha', 2023, 6.8, 32, 'completed', 2,
   'A love triangle exploring unrequited love, betrayal, and redemption. Saad is deeply in love with his cousin Maheer, but when he struggles to confess his feelings, events take an unexpected turn with Areeb.',
   'https://m.media-amazon.com/images/M/MV5BNzMyMzkzMTgtNjhhNi00NTM0LTg4YzctMTRlZjE2MzRjYjkwXkEyXkFqcGc@._V1_.jpg'),

(9, 'Meem Se Mohabbat', 2024, 8.5, 30, 'airing', 3,
   'A captivating love story exploring modern relationships and family dynamics in contemporary Pakistan. Starring Ahad Raza Mir and Dananeer Mobeen.',
   'https://m.media-amazon.com/images/M/MV5BYTc1MTQzN2UtM2FiZi00MWE1LWIyN2MtYTQxZTZjOTY5ZGU1XkEyXkFqcGc@._V1_.jpg'),

(10, 'Aye Ishq e Junoon', 2024, 8.0, 35, 'airing', 2,
    'An intense story of love and obsession featuring Sheheryar Munawar and Ushna Shah.',
    'https://m.media-amazon.com/images/M/MV5BODQ3YzUzYmItNGQ2YS00Nzk4LTgyN2UtYmE4Mjc1ZDdmMTA4XkEyXkFqcGc@._V1_.jpg'),

(11, 'Sunn Mere Dil', 2024, 8.4, 40, 'airing', 1,
    'A mega-project featuring Wahaj Ali and Maya Ali in an emotional journey of love and self-discovery.',
    'https://m.media-amazon.com/images/M/MV5BZTY0ZGU3MjQtNjY1Mi00NzE4LTgzMDQtNmM2NzI3MjFjMGJkXkEyXkFqcGc@._V1_.jpg'),

(12, 'Tere Bin Season 2', 2025, 0.0, 40, 'upcoming', 1,
    'The highly anticipated second season continuing the epic love story of Murtasim and Meerab.',
    'https://m.media-amazon.com/images/M/MV5BZWQ5MjY3OTctNzUyZi00ZWFiLWI4YTUtYzRiYTE4MDFmODllXkEyXkFqcGc@._V1_.jpg'),

(13, 'Sanwal Yaar Piya', 2024, 8.1, 32, 'upcoming', 1,
    'A beautiful romantic drama exploring love and relationships in modern-day Pakistan.',
    'https://m.media-amazon.com/images/M/MV5BNWM2MDRiMjEtMDczMS00NTNiLTlhNzUtNmFkMmYxZmRmY2ZmXkEyXkFqcGc@._V1_.jpg');

-- ============================================
-- SEED: Drama-Genre Relationships
-- ============================================
INSERT INTO drama_genres (drama_id, genre_id) VALUES
-- Tere Bin
(1, 1), (1, 2), (1, 3),
-- Mere Humsafar
(2, 1), (2, 2),
-- Khaani
(3, 2), (3, 4), (3, 1),
-- Parizaad
(4, 2), (4, 1), (4, 6),
-- Humsafar
(5, 1), (5, 2),
-- Ishq Murshid
(6, 1), (6, 2), (6, 7),
-- Kabhi Main Kabhi Tum
(7, 1), (7, 5), (7, 2),
-- Mujhe Pyaar Hua Tha
(8, 1), (8, 2),
-- Meem Se Mohabbat
(9, 1), (9, 2),
-- Aye Ishq e Junoon
(10, 2), (10, 1),
-- Sunn Mere Dil
(11, 1), (11, 2),
-- Tere Bin S2
(12, 1), (12, 2), (12, 3),
-- Sanwal Yaar Piya
(13, 1), (13, 2);

-- ============================================
-- SEED: Cast Members
-- ============================================
INSERT INTO cast_members (id, name, image_url) VALUES
(1, 'Wahaj Ali', NULL),
(2, 'Yumna Zaidi', NULL),
(3, 'Bushra Ansari', NULL),
(4, 'Sabeena Farooq', NULL),
(5, 'Farhan Saeed', NULL),
(6, 'Hania Aamir', NULL),
(7, 'Saba Hameed', NULL),
(8, 'Samina Ahmed', NULL),
(9, 'Feroze Khan', NULL),
(10, 'Sana Javed', NULL),
(11, 'Mehmood Aslam', NULL),
(12, 'Saman Ansari', NULL),
(13, 'Ahmed Ali Akbar', NULL),
(14, 'Ushna Shah', NULL),
(15, 'Nauman Ijaz', NULL),
(16, 'Urwa Hocane', NULL),
(17, 'Saboor Aly', NULL),
(18, 'Fawad Khan', NULL),
(19, 'Mahira Khan', NULL),
(20, 'Naveen Waqar', NULL),
(21, 'Atiqa Odho', NULL),
(22, 'Bilal Abbas Khan', NULL),
(23, 'Durefishan Saleem', NULL),
(24, 'Omair Rana', NULL),
(25, 'Shabbir Jan', NULL),
(26, 'Fahad Mustafa', NULL),
(27, 'Javed Sheikh', NULL),
(28, 'Emmad Irfani', NULL),
(29, 'Zaviyar Nauman Ijaz', NULL),
(30, 'Ahad Raza Mir', NULL),
(31, 'Dananeer Mobeen', NULL),
(32, 'Sheheryar Munawar', NULL),
(33, 'Maya Ali', NULL),
(34, 'Sajal Aly', NULL);

-- ============================================
-- SEED: Drama-Cast Relationships
-- ============================================
INSERT INTO drama_cast (drama_id, cast_id, role_name, is_lead) VALUES
-- Tere Bin
(1, 1, 'Murtasim', TRUE),
(1, 2, 'Meerab', TRUE),
(1, 3, NULL, FALSE),
(1, 4, NULL, FALSE),
-- Mere Humsafar
(2, 5, 'Hamza', TRUE),
(2, 6, 'Hala', TRUE),
(2, 7, NULL, FALSE),
(2, 8, NULL, FALSE),
-- Khaani
(3, 9, 'Mir Hadi', TRUE),
(3, 10, 'Khaani', TRUE),
(3, 11, NULL, FALSE),
(3, 12, NULL, FALSE),
-- Parizaad
(4, 13, 'Parizaad', TRUE),
(4, 2, NULL, FALSE),
(4, 14, NULL, FALSE),
(4, 15, NULL, FALSE),
(4, 16, NULL, FALSE),
(4, 17, NULL, FALSE),
-- Humsafar
(5, 18, 'Ashar', TRUE),
(5, 19, 'Khirad', TRUE),
(5, 20, NULL, FALSE),
(5, 21, NULL, FALSE),
-- Ishq Murshid
(6, 22, 'Murshid', TRUE),
(6, 23, 'Shibra', TRUE),
(6, 24, NULL, FALSE),
(6, 25, NULL, FALSE),
-- Kabhi Main Kabhi Tum
(7, 26, 'Mustafa', TRUE),
(7, 6, 'Sharjeena', TRUE),
(7, 27, NULL, FALSE),
(7, 3, NULL, FALSE),
(7, 28, NULL, FALSE),
-- Mujhe Pyaar Hua Tha
(8, 1, 'Saad', TRUE),
(8, 6, 'Maheer', TRUE),
(8, 29, 'Areeb', TRUE),
-- Meem Se Mohabbat
(9, 30, NULL, TRUE),
(9, 31, NULL, TRUE),
-- Aye Ishq e Junoon
(10, 32, NULL, TRUE),
(10, 14, NULL, TRUE),
-- Sunn Mere Dil
(11, 1, NULL, TRUE),
(11, 33, NULL, TRUE),
-- Tere Bin S2
(12, 1, 'Murtasim', TRUE),
(12, 2, 'Meerab', TRUE),
-- Sanwal Yaar Piya
(13, 30, NULL, TRUE),
(13, 34, NULL, TRUE);

-- ============================================
-- SEED: Sample Test User (password: test123)
-- Password hash for 'test123' using PHP password_hash()
-- ============================================
INSERT INTO users (id, username, email, password, avatar, bio, created_at) VALUES
(1, 'DramaFan', 'dramafan@test.com', 
   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is hash for 'password', change it
   'https://api.dicebear.com/7.x/avataaars/svg?seed=DramaFan',
   'Love watching Pakistani dramas! Especially romantic ones.',
   '2024-01-01 00:00:00');

-- ============================================
-- SEED: Sample User Drama Entries
-- ============================================
INSERT INTO user_dramas (user_id, drama_id, status, user_rating, episodes_watched, review, date_completed) VALUES
(1, 4, 'completed', 10, 29, 'Parizaad is a masterpiece! Ahmed Ali Akbar gave the performance of a lifetime.', '2024-06-15'),
(1, 7, 'completed', 9, 34, 'Such a fun drama! Fahad Mustafa and Hania Aamir have amazing chemistry.', '2024-12-01'),
(1, 5, 'completed', 10, 23, 'A classic that never gets old. Fawad and Mahira were iconic.', '2023-03-20'),
(1, 9, 'watching', NULL, 15, NULL, NULL),
(1, 1, 'plan_to_watch', NULL, 0, NULL, NULL);

-- ============================================
-- Verification Queries
-- ============================================
-- Check if everything was inserted correctly
SELECT 'Channels' AS table_name, COUNT(*) AS count FROM channels
UNION ALL
SELECT 'Genres', COUNT(*) FROM genres
UNION ALL
SELECT 'Dramas', COUNT(*) FROM dramas
UNION ALL
SELECT 'Cast Members', COUNT(*) FROM cast_members
UNION ALL
SELECT 'Drama-Genre Links', COUNT(*) FROM drama_genres
UNION ALL
SELECT 'Drama-Cast Links', COUNT(*) FROM drama_cast
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Drama Entries', COUNT(*) FROM user_dramas;
