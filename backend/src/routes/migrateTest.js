const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

router.get('/migrate', (req, res) => {
    const scriptPath = path.join(__dirname, '../../scripts/migrate-supabase-to-mysql.js');
    
    // Run the migration script
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        let output = `<h1>Full Migration Logs</h1><pre>`;
        
        if (stdout) output += `<b>STDOUT:</b>\n${stdout}\n\n`;
        if (stderr) output += `<b>STDERR:</b>\n${stderr}\n\n`;
        if (error) output += `<b>ERROR:</b>\n${error.message}\n\n`;
        
        output += `</pre>`;
        res.send(output);
    });
});

// Reset Admin Password endpoint
router.get('/reset-admin', async (req, res) => {
    try {
        const { User } = require('../models');
        const adminEmail = 'admin@gmail.com';
        const newPassword = 'admin12345';

        const user = await User.findOne({ where: { email: adminEmail } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Admin user not found' });
        }

        user.password = newPassword;
        user.is_verified = true; // Auto-verify to prevent hanging on email send
        await user.save();

        res.json({
            success: true,
            message: 'Admin password reset successfully',
            credentials: {
                email: adminEmail,
                password: newPassword
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
