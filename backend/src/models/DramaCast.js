module.exports = (sequelize, DataTypes) => {
    const DramaCast = sequelize.define('DramaCast', {
        drama_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'dramas',
                key: 'id'
            }
        },
        cast_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'cast_members',
                key: 'id'
            }
        },
        role_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_lead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'drama_cast',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return DramaCast;
};
