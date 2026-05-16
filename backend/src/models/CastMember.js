'use strict';

module.exports = (sequelize, DataTypes) => {
    const CastMember = sequelize.define('CastMember', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
        bio: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        birth_date: {
            type: DataTypes.DATEONLY,
            defaultValue: null
        },
        birth_place: {
            type: DataTypes.STRING(200),
            defaultValue: null
        }
    }, {
        tableName: 'cast_members',
        timestamps: true,
        underscored: true,
        updatedAt: false
    });

    return CastMember;
};
