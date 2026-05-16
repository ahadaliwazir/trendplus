'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserList = sequelize.define('UserList', {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'user_lists',
        timestamps: true,
        underscored: true
    });

    UserList.associate = (models) => {
        UserList.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        UserList.belongsToMany(models.Drama, {
            through: 'UserListDrama',
            foreignKey: 'list_id',
            otherKey: 'drama_id',
            as: 'dramas'
        });
    };

    return UserList;
};
