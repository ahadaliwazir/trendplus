/**
 * Create the news table and add sample news articles
 */

const db = require('../src/models');

const sampleNews = [
    {
        title: 'Parizaad Season 2 Officially Announced!',
        content: `Great news for drama fans! HUM TV has officially confirmed the second season of the critically acclaimed drama "Parizaad". 

Ahmed Ali Akbar will reprise his role as the beloved Parizaad. The new season is expected to pick up where the first season ended, exploring new challenges in Parizaad's life.

Director Shehzad Kashmiri shared in an interview that the script is currently being finalized and shooting is expected to begin in early 2026.

Fans have been eagerly awaiting this announcement since the first season's emotional finale that left many questions unanswered.`,
        excerpt: 'HUM TV confirms Parizaad Season 2 with Ahmed Ali Akbar returning. Shooting to begin in 2026.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BN2U0OGFjMzEtNmM0ZC00NzliLTk4MjYtNGQ1NWU3YzQxNzIyXkEyXkFqcGc@._V1_.jpg',
        category: 'announcement',
        source_url: 'https://humtv.com.pk',
        is_featured: true
    },
    {
        title: 'Fawad Khan and Mahira Khan Reunite for New Project',
        content: `Pakistan's most beloved on-screen couple, Fawad Khan and Mahira Khan, are set to reunite for a new drama project.

The duo, who last appeared together in the iconic "Humsafar" (2011), have signed on for a new romantic drama that will air on a major Pakistani channel.

Details about the plot are being kept under wraps, but sources suggest it will be a contemporary love story with political undertones. The drama is being produced by big names in the industry.

This reunion has sent social media into a frenzy, with fans expressing their excitement across platforms.`,
        excerpt: 'Fawad Khan and Mahira Khan to appear together in a new drama after their iconic Humsafar.',
        image_url: 'https://m.media-amazon.com/images/M/MV5BZWFmZmY2ODgtYzRjZi00MjQ4LTkzYjctY2JiZDc0ZDQ2YjYzXkEyXkFqcGc@._V1_.jpg',
        category: 'cast_news',
        source_url: null,
        is_featured: true
    },
    {
        title: 'Lux Style Awards 2025: Complete List of Drama Nominations',
        content: `The nominations for Lux Style Awards 2025 have been announced, with several Pakistani dramas receiving multiple nominations.

Best Drama Serial nominations include:
- Tere Bin
- Mere Humsafar  
- Khaie
- Jaan-e-Jahan

Best Actor nominations feature familiar faces like Wahaj Ali, Feroze Khan, and Danish Taimoor, while Best Actress nominations include Yumna Zaidi, Hania Aamir, and Ayeza Khan.

The awards ceremony is scheduled for March 2025 in Lahore.`,
        excerpt: 'Lux Style Awards 2025 nominations announced with Tere Bin and Mere Humsafar leading the pack.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bd/Lux_Style_Awards_logo.svg/250px-Lux_Style_Awards_logo.svg.png',
        category: 'awards',
        source_url: null,
        is_featured: false
    },
    {
        title: 'ARY Digital Announces New Drama Timeslot Changes',
        content: `ARY Digital has announced major changes to its drama programming schedule starting next month.

Prime time dramas will now air at 8:00 PM instead of 9:00 PM. The network says this change is based on viewer feedback and research about audience viewing patterns.

Current dramas like "Kabhi Main Kabhi Tum" and "Sunn Mere Dil" will move to the new timeslot immediately.

The change is expected to help the channel compete with HUM TV and other networks for the prime time audience.`,
        excerpt: 'ARY Digital shifts prime time dramas to 8:00 PM based on audience research.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/Ary_Digital_2023.svg/250px-Ary_Digital_2023.svg.png',
        category: 'industry',
        source_url: null,
        is_featured: false
    },
    {
        title: 'Review: Why "Tere Bin" Became the Biggest Drama of 2023',
        content: `"Tere Bin" starring Yumna Zaidi and Wahaj Ali has become one of the most-watched Pakistani dramas of all time. But what made it so special?

The drama combined classic romance tropes with modern storytelling. The enemies-to-lovers arc between Meerab and Murtasim captured hearts across South Asia and beyond.

Chemistry between the leads, stunning visuals from the haveli setting, and a well-paced storyline all contributed to its success.

The drama also sparked important conversations about forced marriage, women's agency, and family dynamics in Pakistani society.`,
        excerpt: 'An analysis of what made Tere Bin the biggest drama phenomenon of 2023.',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Tere_Bin_poster.jpeg',
        category: 'review',
        source_url: null,
        is_featured: false
    }
];

async function createNewsTable() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to database');

        // Sync the News model to create the table
        await db.News.sync({ force: false });
        console.log('✅ News table created/verified');

        // Check if news already exists
        const existingCount = await db.News.count();
        if (existingCount > 0) {
            console.log(`⏭️  ${existingCount} news articles already exist, skipping seed`);
            process.exit(0);
        }

        // Add sample news
        for (const news of sampleNews) {
            await db.News.create(news);
            console.log(`✅ Added: ${news.title.substring(0, 50)}...`);
        }

        console.log(`\n📰 Added ${sampleNews.length} sample news articles`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createNewsTable();
