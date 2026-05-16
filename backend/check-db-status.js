const db = require('./src/models');

async function checkDramas() {
    try {
        await db.sequelize.authenticate();

        const total = await db.Drama.count();
        const byStatus = await db.Drama.findAll({
            attributes: [
                'status',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const zeroRating = await db.Drama.count({ where: { imdb_rating: 0 } });

        console.log(`Total Dramas: ${total}`);
        console.log('By Status:');
        byStatus.forEach(s => console.log(`  ${s.status}: ${s.get('count')}`));
        console.log(`Dramas with 0 rating: ${zeroRating}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

checkDramas();
