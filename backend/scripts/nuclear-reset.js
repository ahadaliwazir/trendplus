const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: true
        }
    }
};

async function nuclearReset() {
    console.log(`🚀 Starting Nuclear Reset on database: ${config.database}...`);
    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: config.dialectOptions,
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Disable foreign key checks to allow dropping tables in any order
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('⚠️ Foreign key checks disabled.');

        // Get all table names
        const [tables] = await sequelize.query('SHOW TABLES');

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`🔥 Dropping table: ${tableName}...`);
            await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        }

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables dropped successfully.');
        console.log('✨ Your database is now clean and ready for a fresh migration!');
    } catch (error) {
        console.error('❌ Reset failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

nuclearReset();
