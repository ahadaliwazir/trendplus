'use strict';

module.exports = (sequelize, DataTypes) => {
    const ReviewLike = sequelize.define('ReviewLike', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        review_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user_reviews',
                key: 'id'
            }
        }
    }, {
        tableName: 'review_likes',
        timestamps: true,
        underscored: true,
        updatedAt: false, // Only care about when the like was created
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'review_id']
            }
        ]
    });

    return ReviewLike;
};
