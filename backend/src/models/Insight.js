const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Insight = sequelize.define('Insight', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        drama_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dramas',
                key: 'id'
            }
        },
        episode_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'episodes',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM('FASHION', 'DECOR', 'LIFESTYLE', 'SOCIAL', 'SENTIMENT'),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        confidence: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        source_data: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'insights',
        timestamps: true,
        underscored: true
    });

    Insight.associate = (models) => {
        Insight.belongsTo(models.Drama, { foreignKey: 'drama_id' });
        Insight.belongsTo(models.Episode, { foreignKey: 'episode_id' });
    };

    return Insight;
};
