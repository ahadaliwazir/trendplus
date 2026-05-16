'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserListDrama = sequelize.define('UserListDrama', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        list_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user_lists',
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
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'user_list_dramas',
        timestamps: true,
        underscored: true
    });

    UserListDrama.associate = (models) => {
        UserListDrama.belongsTo(models.UserList, { foreignKey: 'list_id' });
        UserListDrama.belongsTo(models.Drama, { foreignKey: 'drama_id' });
    };

    return UserListDrama;
};
