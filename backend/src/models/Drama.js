'use strict';

module.exports = (sequelize, DataTypes) => {
    const Drama = sequelize.define('Drama', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Title is required'
                }
            }
        },
        slug: {
            type: DataTypes.STRING(191),
            allowNull: true,
            unique: true
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1950,
                max: 2030
            }
        },
        imdb_rating: {
            type: DataTypes.DECIMAL(3, 1),
            defaultValue: 0.0,
            validate: {
                min: 0,
                max: 10
            }
        },
        site_rating: {
            type: DataTypes.DECIMAL(3, 1),
            defaultValue: 0.0,
            validate: {
                min: 0,
                max: 10
            }
        },
        episodes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        },
        current_episode: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        status: {
            type: DataTypes.ENUM('airing', 'completed', 'upcoming'),
            allowNull: false,
            defaultValue: 'upcoming'
        },
        channel_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'channels',
                key: 'id'
            }
        },
        synopsis: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        image_url: {
            type: DataTypes.STRING(1500),
            defaultValue: null
        },
        vote_count: {
            type: DataTypes.STRING(20),
            defaultValue: '0'
        },
        trailer_url: {
            type: DataTypes.STRING(1500),
            defaultValue: null
        },
        cast_names: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        is_hero: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        hero_image_url: {
            type: DataTypes.STRING(1500),
            allowNull: true
        },
        hero_pos_x: {
            type: DataTypes.INTEGER,
            defaultValue: 50
        },
        hero_pos_y: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        hero_scale: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 1.0
        },
        feature_rank: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                min: 1,
                max: 10
            }
        },
        site_vote_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'dramas',
        timestamps: true,
        underscored: true
    });

    return Drama;
};
