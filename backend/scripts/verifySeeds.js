const { Drama, Channel } = require('../src/models');

async function verify() {
    try {
        const dramas = await Drama.findAll({
            where: { channel_id: 2 }, // ARY Digital
            include: [{ model: Channel, as: 'channel' }],
            order: [['id', 'DESC']],
            limit: 30
        });

        console.log(`Found ${dramas.length} dramas for ARY Digital`);
        dramas.forEach(d => {
            console.log(`- [${d.id}] ${d.title} (${d.year})`);
        });

    } catch (error) {
        console.error('Error verifying dramas:', error);
    } finally {
        process.exit();
    }
}

verify();
