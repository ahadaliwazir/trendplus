require('dotenv').config();
const { Drama } = require('../src/models');

async function updateRating() {
    try {
        const drama = await Drama.findOne({ where: { title: 'Bunty I Love You' } });
        if (drama) {
            await drama.update({ imdb_rating: 5.5 });
            console.log('Updated "Bunty I Love You" rating from', drama.imdb_rating, 'to 5.5');
        } else {
            console.log('Drama not found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updateRating();
