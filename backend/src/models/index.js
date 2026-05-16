'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.url
    ? new Sequelize(dbConfig.url, {
        dialect: dbConfig.dialect,
        dialectOptions: dbConfig.dialectOptions,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: dbConfig.pool
    })
    : new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            dialectOptions: dbConfig.dialectOptions,
            logging: dbConfig.logging,
            define: dbConfig.define,
            pool: dbConfig.pool
        }
    );

const db = {};

// Import Models
db.User = require('./User')(sequelize, DataTypes);
db.Channel = require('./Channel')(sequelize, DataTypes);
db.Genre = require('./Genre')(sequelize, DataTypes);
db.Drama = require('./Drama')(sequelize, DataTypes);
db.CastMember = require('./CastMember')(sequelize, DataTypes);
db.DramaCast = require('./DramaCast')(sequelize, DataTypes);
db.UserDrama = require('./UserDrama')(sequelize, DataTypes);
db.UserReview = require('./UserReview')(sequelize, DataTypes);
db.UserVote = require('./UserVote')(sequelize, DataTypes);
db.Friendship = require('./Friendship')(sequelize, DataTypes);
db.News = require('./News')(sequelize, DataTypes);
db.AdminNotification = require('./AdminNotification')(sequelize, DataTypes);
db.Insight = require('./Insight')(sequelize, DataTypes);

// AdminNotification belongs to User
db.AdminNotification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.User.hasMany(db.AdminNotification, { foreignKey: 'user_id', as: 'notifications' });



// Define Associations

// Drama belongs to Channel
db.Drama.belongsTo(db.Channel, { foreignKey: 'channel_id', as: 'channel' });
db.Channel.hasMany(db.Drama, { foreignKey: 'channel_id', as: 'dramas' });

// Drama has many Genres (through junction table)
db.Drama.belongsToMany(db.Genre, {
    through: 'drama_genres',
    foreignKey: 'drama_id',
    otherKey: 'genre_id',
    as: 'genres',
    timestamps: false
});
db.Genre.belongsToMany(db.Drama, {
    through: 'drama_genres',
    foreignKey: 'genre_id',
    otherKey: 'drama_id',
    as: 'dramas',
    timestamps: false
});

// Drama has many Cast Members (through junction table)
db.Drama.belongsToMany(db.CastMember, {
    through: db.DramaCast,
    foreignKey: 'drama_id',
    otherKey: 'cast_id',
    as: 'cast'
});
db.CastMember.belongsToMany(db.Drama, {
    through: db.DramaCast,
    foreignKey: 'cast_id',
    otherKey: 'drama_id',
    as: 'dramas'
});

// User has many UserDrama entries
db.User.hasMany(db.UserDrama, { foreignKey: 'user_id', as: 'dramaList' });
db.UserDrama.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Drama has many UserDrama entries
db.Drama.hasMany(db.UserDrama, { foreignKey: 'drama_id', as: 'userEntries' });
db.UserDrama.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });

// User has many Reviews
db.User.hasMany(db.UserReview, { foreignKey: 'user_id', as: 'reviews' });
db.UserReview.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Drama has many Reviews
db.Drama.hasMany(db.UserReview, { foreignKey: 'drama_id', as: 'reviews' });
db.UserReview.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });

// User Votes (quick voting without review)
db.User.hasMany(db.UserVote, { foreignKey: 'user_id', as: 'votes' });
db.UserVote.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Drama.hasMany(db.UserVote, { foreignKey: 'drama_id', as: 'votes' });
db.UserVote.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });

// Friendship associations
db.User.hasMany(db.Friendship, { foreignKey: 'requester_id', as: 'sentRequests' });
db.Friendship.belongsTo(db.User, { foreignKey: 'requester_id', as: 'requester' });
db.User.hasMany(db.Friendship, { foreignKey: 'addressee_id', as: 'receivedRequests' });
db.Friendship.belongsTo(db.User, { foreignKey: 'addressee_id', as: 'addressee' });

// Review Likes
db.ReviewLike = require('./ReviewLike')(sequelize, DataTypes);
db.UserReview.hasMany(db.ReviewLike, { foreignKey: 'review_id', as: 'likes' });
db.ReviewLike.belongsTo(db.UserReview, { foreignKey: 'review_id', as: 'review' });
db.User.hasMany(db.ReviewLike, { foreignKey: 'user_id', as: 'reviewLikes' });
db.ReviewLike.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Review Comments
db.ReviewComment = require('./ReviewComment')(sequelize, DataTypes);
db.UserReview.hasMany(db.ReviewComment, { foreignKey: 'review_id', as: 'comments' });
db.ReviewComment.belongsTo(db.UserReview, { foreignKey: 'review_id', as: 'review' });
db.User.hasMany(db.ReviewComment, { foreignKey: 'user_id', as: 'reviewComments' });
db.ReviewComment.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Social Features: Drama Comments
db.DramaComment = require('./DramaComment')(sequelize, DataTypes);
db.Drama.hasMany(db.DramaComment, { foreignKey: 'drama_id', as: 'comments' });
db.DramaComment.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });
db.User.hasMany(db.DramaComment, { foreignKey: 'user_id', as: 'dramaComments' });
db.DramaComment.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.DramaComment.hasMany(db.DramaComment, { foreignKey: 'parent_id', as: 'replies' });
db.DramaComment.belongsTo(db.DramaComment, { foreignKey: 'parent_id', as: 'parent' });


// Social Features: User Lists
db.UserList = require('./UserList')(sequelize, DataTypes);
db.UserListDrama = require('./UserListDrama')(sequelize, DataTypes);
db.User.hasMany(db.UserList, { foreignKey: 'user_id', as: 'customLists' });
db.UserList.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.UserList.belongsToMany(db.Drama, {
    through: db.UserListDrama,
    foreignKey: 'list_id',
    otherKey: 'drama_id',
    as: 'dramas'
});
db.Drama.belongsToMany(db.UserList, {
    through: db.UserListDrama,
    foreignKey: 'drama_id',
    otherKey: 'list_id',
    as: 'userLists'
});

// Episodes
db.Episode = require('./Episode')(sequelize, DataTypes);
db.Drama.hasMany(db.Episode, { foreignKey: 'drama_id', as: 'episodeList' });
db.Episode.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });

// Insights
db.Drama.hasMany(db.Insight, { foreignKey: 'drama_id', as: 'insights' });
db.Insight.belongsTo(db.Drama, { foreignKey: 'drama_id', as: 'drama' });
db.Episode.hasMany(db.Insight, { foreignKey: 'episode_id', as: 'insights' });
db.Insight.belongsTo(db.Episode, { foreignKey: 'episode_id', as: 'episode' });


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
