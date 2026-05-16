const { sequelize, Drama } = require('../src/models');

async function restoreFeatures() {
    try {
        console.log('Restoring database features...');

        // Add column back
        try {
            await sequelize.query("ALTER TABLE dramas ADD COLUMN air_days VARCHAR(255) DEFAULT NULL AFTER current_episode");
            console.log('✅ air_days column added.');
        } catch (err) {
            console.log('ℹ️ Column already exists or error:', err.message);
        }

        // Restore sample data
        const schedule = {
            'Kabhi Main Kabhi Tum': 'Monday, Tuesday',
            'Ishq Murshid': 'Sunday',
            'Khaie': 'Friday, Saturday',
            'Zard Anton Ka Sandesha': 'Thursday',
            'Gentleman': 'Sunday',
            'Parizaad': 'Tuesday',
            'Humsafar': 'Saturday',
            'Tere Bin': 'Wednesday, Thursday'
        };

        for (const [title, days] of Object.entries(schedule)) {
            await Drama.update({ air_days: days }, {
                where: { title: title }
            });
            console.log(`Updated ${title} schedule.`);
        }

        console.log('✅ Database restoration complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error restoring database:', error);
        process.exit(1);
    }
}

restoreFeatures();
