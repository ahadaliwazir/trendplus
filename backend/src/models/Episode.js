module.exports = (sequelize, DataTypes) => {
    const Episode = sequelize.define('Episode', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        drama_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dramas', // lowercase to match tableName of Drama model
                key: 'id'
            }
        },
        episode_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        video_url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        duration: {
            type: DataTypes.INTEGER, // Duration in minutes
            allowNull: true
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        release_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    }, {
        tableName: 'episodes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['drama_id', 'episode_number']
            }
        ]
    });

    return Episode;
};
