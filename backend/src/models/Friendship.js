'use strict';

module.exports = (sequelize, DataTypes) => {
    const Friendship = sequelize.define('Friendship', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requester_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        addressee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
            allowNull: false,
            defaultValue: 'pending'
        }
    }, {
        tableName: 'friendships',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['requester_id', 'addressee_id']
            }
        ]
    });

    return Friendship;
};
