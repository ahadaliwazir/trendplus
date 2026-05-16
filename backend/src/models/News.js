'use strict';

module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(300),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Title is required'
                }
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        excerpt: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(1500),
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM('announcement', 'cast_news', 'awards', 'industry', 'review', 'other'),
            allowNull: false,
            defaultValue: 'other'
        },
        source_url: {
            type: DataTypes.STRING(1500),
            allowNull: true
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'news',
        timestamps: true,
        underscored: true
    });

    return News;
};
