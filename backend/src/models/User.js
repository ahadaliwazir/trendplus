'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: {
                msg: 'Username already taken'
            },
            validate: {
                len: {
                    args: [3, 50],
                    msg: 'Username must be between 3 and 50 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: {
                msg: 'Email already registered'
            },
            validate: {
                isEmail: {
                    msg: 'Please provide a valid email'
                }
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [8, 255],
                    msg: 'Password must be at least 8 characters'
                }
            }
        },
        avatar: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
        bio: {
            type: DataTypes.TEXT,
            defaultValue: null
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
        warning_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        is_blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        banned_until: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
        ban_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        reset_token: {
            type: DataTypes.STRING(64),
            defaultValue: null,
            allowNull: true
        },
        reset_token_expires: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
        share_token: {
            type: DataTypes.STRING(64),
            defaultValue: null,
            allowNull: true,
            unique: true
        },
        share_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        has_completed_onboarding: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        verification_otp: {
            type: DataTypes.STRING(6),
            allowNull: true
        },
        verification_otp_expires: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
                if (!user.avatar) {
                    user.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 12);
                }
            }
        }
    });

    // Instance method to check password
    User.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    // Hide password in JSON responses
    User.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        delete values.password;
        return values;
    };

    return User;
};
