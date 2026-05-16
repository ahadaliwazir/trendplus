/**
 * Migration to add voting tables and columns
 */
const db = require('../src/models');

async function migrate() {
    try {
        console.log('Starting voting system migration...');

        const queryInterface = db.sequelize.getQueryInterface();

        // Add site_vote_count column to dramas if it doesn't exist
        const dramaDesc = await queryInterface.describeTable('dramas');

        if (!dramaDesc.site_vote_count) {
            console.log('➕ Adding site_vote_count column to dramas...');
            await queryInterface.addColumn('dramas', 'site_vote_count', {
                type: db.Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: true
            });
            console.log('✅ site_vote_count column added.');
        } else {
            console.log('✅ site_vote_count already exists.');
        }

        // Create user_votes table if it doesn't exist
        const tables = await queryInterface.showAllTables();

        if (!tables.includes('user_votes')) {
            console.log('➕ Creating user_votes table...');
            await queryInterface.createTable('user_votes', {
                id: {
                    type: db.Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: db.Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                drama_id: {
                    type: db.Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'dramas',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                rating: {
                    type: db.Sequelize.INTEGER,
                    allowNull: false
                },
                createdAt: {
                    type: db.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updatedAt: {
                    type: db.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            // Add unique index
            await queryInterface.addIndex('user_votes', ['user_id', 'drama_id'], {
                unique: true,
                name: 'user_votes_user_drama_unique'
            });

            console.log('✅ user_votes table created.');
        } else {
            console.log('✅ user_votes table already exists.');
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
