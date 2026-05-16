const db = require('../src/models');

const VOTE_UPDATES = {
    'Humsafar': '5.2K',
    'Kabhi Main Kabhi Tum': '5.8K',
    'Mere Humsafar': '2.8K',
    'Meem Se Mohabbat': '1.8K',
    'Sunn Mere Dil': '2.3K',
    'Aye Ishq e Junoon': '1.5K',
    'Mujhe Pyaar Hua Tha': '2.1K',
    'Tere Bin': '3.2K',
    'Khaani': '3.5K',
    'Jafaa': '1.2K',
    'Muamma': '850',
    'Ek Jhooti Kahani': '420',
    'Ishq Murshid': '4.1K',
    'Sanwal Yaar Piya': '980',
    'Masoom': '310',
    'Neeli Kothi': '280'
};

async function fixVoteCounts() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        for (const [title, votes] of Object.entries(VOTE_UPDATES)) {
            const drama = await db.Drama.findOne({ where: { title } });
            if (drama) {
                drama.vote_count = votes;
                await drama.save();
                console.log(`✅ Updated ${title}: ${votes} votes`);
            } else {
                console.log(`⚠️ Drama not found: ${title}`);
            }
        }

        console.log('\n✅ Vote counts fixed!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

fixVoteCounts();
