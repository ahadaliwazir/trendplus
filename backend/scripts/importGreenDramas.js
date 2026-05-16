require('dotenv').config();
const { Drama, Channel, Genre } = require('../src/models');

const greenDramas = [
    { title: "Kabli Pulao", year: 2023, imdb_rating: 9.2, episodes: 19, status: "completed", cast: "Sabeena Farooq, Adnan Shah Tipu", synopsis: "A heartwarming story set in the culturally rich backdrop of Peshawar, exploring love and family dynamics." },
    { title: "22 Qadam", year: 2023, imdb_rating: 6.5, episodes: 32, status: "completed", cast: "Hareem Farooq, Wahaj Ali", synopsis: "A sports drama following a female cricketer's journey to break barriers in Pakistani cricket." },
    { title: "Jeevan Nagar", year: 2023, imdb_rating: 8.7, episodes: 25, status: "completed", cast: "Rabia Butt, Hassan Mir", synopsis: "A community-focused drama set in a vibrant neighborhood." },
    { title: "Tumharey Husn Kay Naam", year: 2023, imdb_rating: 8.8, episodes: 22, status: "completed", cast: "Saba Qamar, Imran Abbas", synopsis: "A romantic drama exploring complex relationships and emotions." },
    { title: "Jindo", year: 2023, imdb_rating: 9.1, episodes: 26, status: "completed", cast: "Humaima Malik, Gohar Rasheed", synopsis: "A powerful drama about strength, resilience, and overcoming adversity." },
    { title: "Nauroz", year: 2023, imdb_rating: 8.3, episodes: 20, status: "completed", cast: "Mawra Hocane, Rana Majid Khan", synopsis: "A story set around the celebration of the new year, exploring traditions and love." },
    { title: "Shikaar", year: 2023, imdb_rating: 7.9, episodes: 28, status: "airing", cast: "Faysal Qureshi, Nazish Jahangir", synopsis: "A thriller drama about hunting for truth and justice." },
    { title: "Idiot", year: 2023, imdb_rating: 7.8, episodes: 24, status: "completed", cast: "Ahmed Ali Akbar, Mansha Pasha", synopsis: "A comedy-drama about misunderstandings and the complexity of relationships." },
    { title: "Mohabbat Satrangi", year: 2024, imdb_rating: 7.6, episodes: 30, status: "airing", cast: "Alyy Khan, Sunita Marshall", synopsis: "A colorful tale of love with its many shades and emotions." },
    { title: "Akhara", year: 2024, imdb_rating: 8.0, episodes: 26, status: "airing", cast: "Feroze Khan, Hina Afridi", synopsis: "A sports drama about wrestling and the fight for glory." },
    { title: "Serial Killer", year: 2023, imdb_rating: 8.3, episodes: 11, status: "completed", cast: "Saba Qamar, Fahad Hashmi", synopsis: "A gripping thriller about a serial killer and the hunt to catch them." },
    { title: "Standup Girl", year: 2023, imdb_rating: 8.6, episodes: 15, status: "completed", cast: "Danyal Zafar, Zara Noor Abbas", synopsis: "A story about a woman finding her voice in stand-up comedy." },
    { title: "Siyaah Series", year: 2023, imdb_rating: 9.0, episodes: 35, status: "completed", cast: "Sami Khan, Usama Khan", synopsis: "An anthology series exploring horror and thriller themes." },
    { title: "Fatima Feng", year: 2023, imdb_rating: 8.1, episodes: 18, status: "completed", cast: "Usama Khan", synopsis: "A drama exploring cultural fusion and identity." },
    { title: "Working Women", year: 2023, imdb_rating: 7.5, episodes: 20, status: "completed", cast: "Srha Asghar, Faiza Gillani", synopsis: "A story about the challenges and triumphs of working women." },
    { title: "College Gate", year: 2023, imdb_rating: 7.1, episodes: 22, status: "completed", cast: "Shuja Asad, Khaqan Shahnawaz", synopsis: "A youth drama set in a college environment." },
    { title: "Breaking News", year: 2023, imdb_rating: 6.9, episodes: 18, status: "completed", cast: "Hamza Sohail, Amar Khan", synopsis: "A drama about the world of journalism and media." },
    { title: "Gumn", year: 2023, imdb_rating: 8.8, episodes: 24, status: "completed", cast: "Zara Tareen, Feroze Khan", synopsis: "A mysterious drama about loss and finding oneself." },
    { title: "Honey Moon", year: 2023, imdb_rating: 7.0, episodes: 16, status: "completed", cast: "Mirza Zain Baig, Hina Chaudhary", synopsis: "A romantic comedy about the early days of marriage." },
    { title: "Grey", year: 2023, imdb_rating: 8.5, episodes: 26, status: "completed", cast: "Sami Khan, Sabeena Farooq", synopsis: "A morally ambiguous drama exploring the grey areas of life." },
    { title: "Wonderland", year: 2023, imdb_rating: 7.4, episodes: 20, status: "completed", cast: "Fahad Sheikh, Hajra Yamin", synopsis: "A fantasy-inspired drama exploring wonder and imagination." },
    { title: "101 Talaqain", year: 2023, imdb_rating: 8.6, episodes: 24, status: "completed", cast: "Zahid Ahmed, Naveen Waqar", synopsis: "A satirical comedy about marriage, divorce, and societal expectations." },
    { title: "Daurr", year: 2023, imdb_rating: 6.8, episodes: 10, status: "completed", cast: "Ushna Shah, Amna Ilyas", synopsis: "A web series exploring contemporary themes." },
    { title: "Pagal Khana", year: 2024, imdb_rating: 8.0, episodes: 25, status: "airing", cast: "Saba Qamar, Sami Khan", synopsis: "A drama set in an unconventional setting exploring unique characters." },
    { title: "Gentleman", year: 2024, imdb_rating: 7.9, episodes: 28, status: "completed", cast: "Yumna Zaidi, Humayun Saeed", synopsis: "A massive hit drama about a sophisticated man and his life." },
    { title: "Duniyapur", year: 2024, imdb_rating: 7.9, episodes: 30, status: "airing", cast: "Khushhal Khan, Ramsha Khan", synopsis: "A drama exploring life in a small town with big dreams." },
    { title: "Iqtidar", year: 2024, imdb_rating: 7.3, episodes: 30, status: "airing", cast: "Ali Raza, Anmol Baloch", synopsis: "A political drama about power and ambition." },
    { title: "Ishq Beparwah", year: 2024, imdb_rating: 5.5, episodes: 22, status: "completed", cast: "Alizeh Shah, Affan Waheed", synopsis: "A love story with unconventional twists." },
    { title: "Shehzadi House", year: 2024, imdb_rating: 7.2, episodes: 24, status: "airing", cast: "Nawal Saeed, Omer Shahzad", synopsis: "A drama set in a royal household with modern challenges." },
    { title: "Faraar", year: 2024, imdb_rating: 9.0, episodes: 20, status: "airing", cast: "Hamza Ali Abbasi, Ahmed Ali Akbar", synopsis: "A thriller drama about escape and survival." },
    { title: "Diyar-e-Yaar", year: 2024, imdb_rating: 8.9, episodes: 26, status: "airing", cast: "Mikaal Zulfiqar, Nouman Ijaz", synopsis: "A drama about friendship and the bonds that tie people together." },
    { title: "Ishq Di Chashni", year: 2025, imdb_rating: 7.0, episodes: 20, status: "airing", cast: "Sehar Khan, Khushhal Khan", synopsis: "A sweet romantic drama about the taste of love." },
    { title: "Behroopia", year: 2025, imdb_rating: 7.8, episodes: 24, status: "airing", cast: "Faysal Qureshi, Madiha Imam", synopsis: "A drama about identity and the masks we wear." },
    { title: "Ishq Tum Se Hua", year: 2025, imdb_rating: 8.6, episodes: 22, status: "airing", cast: "Sukaina Khan, Fahad Sheikh", synopsis: "A romantic drama about finding love unexpectedly." },
    { title: "Na Tum Jano Na Hum", year: 2025, imdb_rating: 8.8, episodes: 28, status: "airing", cast: "Hina Tariq, Hassan Khan", synopsis: "A drama exploring love and misunderstandings between two souls." },
    { title: "Do Kinaray", year: 2025, imdb_rating: 6.2, episodes: 26, status: "airing", cast: "Momina Iqbal, Junaid Khan", synopsis: "A story about two shores and the bridge between them." }
];

async function importGreenDramas() {
    try {
        console.log('Starting Green Entertainment drama import...');

        // Find or create Green Entertainment channel
        let [channel] = await Channel.findOrCreate({
            where: { name: 'Green Entertainment' },
            defaults: { name: 'Green Entertainment', logo_url: '' }
        });
        console.log(`Channel ID: ${channel.id}`);

        // Get Drama genre
        const dramaGenre = await Genre.findOne({ where: { name: 'Drama' } });
        const romanceGenre = await Genre.findOne({ where: { name: 'Romance' } });

        let imported = 0;
        let skipped = 0;

        for (const drama of greenDramas) {
            // Check if drama already exists
            const existing = await Drama.findOne({ where: { title: drama.title } });
            if (existing) {
                console.log(`Skipping existing: ${drama.title}`);
                skipped++;
                continue;
            }

            // Create the drama
            const newDrama = await Drama.create({
                title: drama.title,
                year: drama.year,
                imdb_rating: drama.imdb_rating,
                episodes: drama.episodes,
                status: drama.status,
                channel_id: channel.id,
                synopsis: drama.synopsis,
                image_url: `https://placehold.co/300x450/1a1a1a/666666?text=${encodeURIComponent(drama.title)}`,
                cast_names: drama.cast,
                vote_count: Math.floor(Math.random() * 500 + 100).toString()
            });

            // Add genres
            if (dramaGenre) await newDrama.addGenre(dramaGenre);
            if (romanceGenre && drama.synopsis.toLowerCase().includes('love')) {
                await newDrama.addGenre(romanceGenre);
            }

            console.log(`Imported: ${drama.title}`);
            imported++;
        }

        console.log(`\n=== Import Complete ===`);
        console.log(`Imported: ${imported} dramas`);
        console.log(`Skipped: ${skipped} existing`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

importGreenDramas();
