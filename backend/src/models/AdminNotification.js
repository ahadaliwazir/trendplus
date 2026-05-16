'use strict';

module.exports = (sequelize, DataTypes) => {
    const AdminNotification = sequelize.define('AdminNotification', {
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
        type: {
            type: DataTypes.ENUM('profanity_warning', 'user_blocked', 'report', 'other'),
            allowNull: false,
            defaultValue: 'other'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        context: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'admin_notifications',
        timestamps: true,
        underscored: true
    });

    return AdminNotification;
};
