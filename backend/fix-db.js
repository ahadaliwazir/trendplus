const { sequelize } = require('./src/models');

const updateDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        console.log('Adding "role" column to users table...');
        await sequelize.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER bio");
        console.log('✅ Column added successfully!');

        process.exit(0);
    } catch (error) {
        if (error.original && (error.original.code === 'ER_DUP_COLUMN_NAME' || error.original.code === 'ER_DUP_FIELDNAME')) {
            console.log('ℹ️ Column "role" already exists.');
            process.exit(0);
        }
        console.error('❌ Error updating database:', error);
        process.exit(1);
    }
};

updateDatabase();
