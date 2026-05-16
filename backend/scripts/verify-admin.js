const { User } = require('../src/models');
require('dotenv').config();

async function verifyAdmin() {
    try {
        const user = await User.findOne({ where: { email: 'admin@gmail.com' } });
        if (user) {
            user.is_verified = true;
            user.verification_otp = null;
            user.verification_otp_expires = null;
            await user.save();
            console.log('✅ admin@gmail.com has been manually verified.');
        } else {
            console.log('❌ User admin@gmail.com not found.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit();
    }
}

verifyAdmin();
