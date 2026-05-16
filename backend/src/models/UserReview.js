'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserReview = sequelize.define('UserReview', {
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
        drama_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dramas',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING(200),
            defaultValue: null
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10
            }
        },
        helpful_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'user_reviews',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'drama_id']
            }
        ]
    });

    return UserReview;
};
