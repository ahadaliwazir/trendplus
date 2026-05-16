const { sequelize, User } = require('./src/models');

const promoteToAdmin = async (userIdOrUsername) => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        let user;
        if (isNaN(userIdOrUsername)) {
            user = await User.findOne({ where: { username: userIdOrUsername } });
        } else {
            user = await User.findByPk(userIdOrUsername);
        }

        if (!user) {
            console.error('User not found.');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${user.username} to ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
};

const arg = process.argv[2];
if (!arg) {
    console.log('Usage: node promote-admin.js <username_or_id>');
    process.exit(1);
}

promoteToAdmin(arg);
