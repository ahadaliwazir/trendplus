'use strict';

module.exports = (sequelize, DataTypes) => {
    const ReviewComment = sequelize.define('ReviewComment', {
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
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'review_comments',
        timestamps: true,
        underscored: true
    });

    return ReviewComment;
};
