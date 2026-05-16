/**
 * Script to add new Pakistani dramas to the database
 * All dramas set to "completed" status
 */

const db = require('../src/models');

const newDramas = [
    {
        title: 'Alpha Bravo Charlie',
        year: 1998,
        imdb_rating: 9.4,
        vote_count: '3200',
        episodes: 17,
        status: 'completed',
        channel_id: 1, // PTV
        synopsis: 'A coming-of-age story of three friends who join the Pakistan Army and face tests of friendship and duty.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BOWVjOTcyZWMtM2RlYy00N2IxLThmNTMtZTgzNjc4MDhlOGI4XkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Dhoop Kinare',
        year: 1987,
        imdb_rating: 9.1,
        vote_count: '176',
        episodes: 22,
        status: 'completed',
        channel_id: 1, // PTV
        synopsis: 'A legendary classic revolving around the lives of doctors in a hospital and their personal struggles and romance.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BMjkwODg3MjEtMWI5Yi00M2VhLTk1ZjEtMmE1YjU3ZjZiMGRjXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Ankahi',
        year: 1982,
        imdb_rating: 9.0,
        vote_count: '72',
        episodes: 12,
        status: 'completed',
        channel_id: 1, // PTV
        synopsis: 'A classic comedy-drama about a young woman striving to support her family while navigating romantic entanglements.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BYTJlZDU2YTUtZjYyZi00NmI5LTg2YjYtOWFjMmU3NDYwNTkyXkEyXkFqcGdeQXVyNjU0NTI0Nw@@._V1_.jpg'
    },
    {
        title: 'Tanhaiyaan',
        year: 1985,
        imdb_rating: 9.0,
        vote_count: '188',
        episodes: 23,
        status: 'completed',
        channel_id: 1, // PTV
        synopsis: 'Two sisters move to a new city after their fathers death and struggle to regain their ancestral home.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BMDM0ODRiOTktMjcxMC00NGU3LTgwZmYtNjBmNGJkYTVkODU4XkEyXkFqcGdeQXVyNjU0NTI0Nw@@._V1_.jpg'
    },
    {
        title: 'Dastaan',
        year: 2010,
        imdb_rating: 8.8,
        vote_count: '1400',
        episodes: 23,
        status: 'completed',
        channel_id: 2, // Hum TV
        synopsis: 'A heart-wrenching story set against the backdrop of the 1947 partition of the Indian subcontinent.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BZWUzYTA5YWItYzRiYS00OTIyLWIyOWItYzE3OWJiMmQyZDFhXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Pyarey Afzal',
        year: 2013,
        imdb_rating: 8.7,
        vote_count: '2300',
        episodes: 33,
        status: 'completed',
        channel_id: 3, // ARY Digital
        synopsis: 'The story of a young man who creates a fictional love story for himself, which eventually leads to dramatic consequences.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BM2RkOTVhYmUtOGVjNC00ODBmLTllM2QtNmVhNzhhMzI4ODJlXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Suno Chanda',
        year: 2018,
        imdb_rating: 8.7,
        vote_count: '3600',
        episodes: 30,
        status: 'completed',
        channel_id: 2, // Hum TV
        synopsis: 'A lighthearted Ramadan special drama about two cousins who hate each other but are forced into a wedding.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BOWM4MjNjODQtODQ0Ny00NjUyLWJiYjctZWRiZDdkYjZiZjk4XkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Ehd-e-Wafa',
        year: 2019,
        imdb_rating: 8.5,
        vote_count: '3200',
        episodes: 24,
        status: 'completed',
        channel_id: 2, // Hum TV (ISPR production)
        synopsis: 'Four high school friends part ways to pursue different careers (Army, Politics, Civil Service, Journalism) and reunite.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BYzA0YzgwZGEtOGRmMy00NjIzLWJlMzQtZDVhOTk2Njc3OTcwXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Meri Zaat Zarra-e-Benishan',
        year: 2009,
        imdb_rating: 8.5,
        vote_count: '592',
        episodes: 22,
        status: 'completed',
        channel_id: 4, // Geo TV
        synopsis: 'A tragic tale of a woman wrongfully accused of adultery and the impact on her daughter years later.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BYmYwZTM1MjctMzM2OS00YTcyLTk4N2ItNzllYzVmYTRiMWE5XkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Mere Paas Tum Ho',
        year: 2019,
        imdb_rating: 8.3,
        vote_count: '4900',
        episodes: 23,
        status: 'completed',
        channel_id: 3, // ARY Digital
        synopsis: 'A middle-class mans life is shattered when his wife leaves him for a wealthy businessman.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BYmE5ZjRlYWQtNzkzZS00ZGE2LTgwOWItYWY4ZDY5M2E3MzUxXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Shehr-e-Zaat',
        year: 2012,
        imdb_rating: 8.1,
        vote_count: '574',
        episodes: 14,
        status: 'completed',
        channel_id: 2, // Hum TV
        synopsis: 'A young womans journey from narcissism and worldly pursuits to spiritual enlightenment and divine love.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BNTMyMjNiZTEtOTg0NC00OTk5LWJlODktMDMxMjk3MDVkMjAzXkEyXkFqcGc@._V1_.jpg'
    },
    {
        title: 'Durr-e-Shehwar',
        year: 2012,
        imdb_rating: 8.2,
        vote_count: '480',
        episodes: 21,
        status: 'completed',
        channel_id: 2, // Hum TV
        synopsis: 'A story exploring the relationship between two generations of women and their views on marriage and sacrifice.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/9/90/Durr-e-Shehwar_title.png'
    },
    {
        title: 'Khuda Aur Mohabbat',
        year: 2021,
        imdb_rating: 8.4,
        vote_count: '5200',
        episodes: 39,
        status: 'completed',
        channel_id: 4, // Geo TV
        synopsis: 'The journey of a young man from love and heartbreak to spiritual awakening and self-discovery.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Khuda_Aur_Mohabbat_%28season_3%29_poster.jpg'
    },
    {
        title: 'Dil Na Umeed To Nahi',
        year: 2021,
        imdb_rating: 8.6,
        vote_count: '1100',
        episodes: 42,
        status: 'completed',
        channel_id: 6, // TV One
        synopsis: 'A hard-hitting drama exploring societal issues like child marriage, human trafficking, and abuse.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/3/3d/Dil_Na_Umeed_Toh_Nahi_Title.jpg'
    },
    {
        title: 'Aangan',
        year: 2018,
        imdb_rating: 7.8,
        vote_count: '1300',
        episodes: 31,
        status: 'completed',
        channel_id: 3, // ARY Digital
        synopsis: 'A period drama about a wealthy family dealing with the partition of India and Pakistan.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/8/8a/Aangan_Title.jpg'
    }
];

async function addNewDramas() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to database');

        let added = 0;
        let skipped = 0;

        for (const drama of newDramas) {
            // Check if drama already exists
            const existing = await db.Drama.findOne({ where: { title: drama.title } });
            if (existing) {
                console.log(`⏭️  Skipped (exists): ${drama.title}`);
                skipped++;
                continue;
            }

            await db.Drama.create(drama);
            console.log(`✅ Added: ${drama.title} (${drama.year})`);
            added++;
        }

        console.log(`\n📊 Summary: Added ${added}, Skipped ${skipped}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addNewDramas();
