const { User } = require('../src/models');

const listUsers = async () => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'created_at']
        });

        console.log('\n--- Registered Users ---');
        users.forEach(user => {
            console.log(`ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role} | Joined: ${user.created_at}`);
        });
        console.log('------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
};

listUsers();
