'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserDrama = sequelize.define('UserDrama', {
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
        status: {
            type: DataTypes.ENUM('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'),
            allowNull: false,
            defaultValue: 'plan_to_watch'
        },
        user_rating: {
            type: DataTypes.INTEGER,
            defaultValue: null,
            validate: {
                min: 1,
                max: 10
            }
        },
        episodes_watched: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        review: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        is_favorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        date_started: {
            type: DataTypes.DATEONLY,
            defaultValue: null
        },
        date_completed: {
            type: DataTypes.DATEONLY,
            defaultValue: null
        }
    }, {
        tableName: 'user_dramas',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'drama_id']
            }
        ]
    });

    return UserDrama;
};
