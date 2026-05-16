'use strict';

module.exports = (sequelize, DataTypes) => {
    const Channel = sequelize.define('Channel', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        logo_url: {
            type: DataTypes.STRING(500),
            defaultValue: null
        }
    }, {
        tableName: 'channels',
        timestamps: true,
        underscored: true,
        updatedAt: false
    });

    return Channel;
};
