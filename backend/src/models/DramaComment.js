'use strict';

module.exports = (sequelize, DataTypes) => {
    const DramaComment = sequelize.define('DramaComment', {
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
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'drama_comments',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'drama_comments',
        timestamps: true,
        underscored: true
    });

    DramaComment.associate = (models) => {
        DramaComment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        DramaComment.belongsTo(models.Drama, { foreignKey: 'drama_id', as: 'drama' });
        DramaComment.belongsTo(models.DramaComment, { foreignKey: 'parent_id', as: 'parent' });
        DramaComment.hasMany(models.DramaComment, { foreignKey: 'parent_id', as: 'replies' });
    };

    return DramaComment;
};
