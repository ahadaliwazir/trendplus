require('dotenv').config();
const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        console.log('🔄 Connecting to database...');
        
        const adminEmail = 'admin@gmail.com';
        const newPassword = 'admin12345';
        
        const user = await User.findOne({ where: { email: adminEmail } });
        
        if (!user) {
            console.error('❌ Admin user not found!');
            process.exit(1);
        }
        
        console.log(`👤 Found user: ${user.username} (${user.email})`);
        
        // Update password (the beforeUpdate hook will hash it automatically)
        user.password = newPassword;
        await user.save();
        
        console.log('✅ Password reset successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 New Password: ${newPassword}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetAdmin();
