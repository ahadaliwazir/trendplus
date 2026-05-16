const db = require('../src/models');

// Correct Parizaad image from IMDb
const PARIZAAD_IMAGE = 'https://m.media-amazon.com/images/M/MV5BN2U0OGFjMzEtNmM0ZC00NzliLTk4MjYtNGQ1NWU3YzQxNzIyXkEyXkFqcGc@._V1_.jpg';
const PARIZAAD_TRAILER = 'https://www.youtube.com/watch?v=Jmp7XxXRHXk';

async function fixParizaadImage() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.');

        const drama = await db.Drama.findOne({ where: { title: 'Parizaad' } });

        if (drama) {
            console.log(`Current image: ${drama.image_url}`);
            drama.image_url = PARIZAAD_IMAGE;
            drama.trailer_url = PARIZAAD_TRAILER;
            drama.vote_count = '4.6K';
            await drama.save();
            console.log(`✅ Updated Parizaad image to: ${PARIZAAD_IMAGE}`);
            console.log(`✅ Updated Parizaad trailer to: ${PARIZAAD_TRAILER}`);
        } else {
            console.log('❌ Parizaad not found in database');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

fixParizaadImage();

