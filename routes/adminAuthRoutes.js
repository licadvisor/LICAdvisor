const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AdminLoginAttempt = require('../models/AdminLoginAttempt');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const ipAddress = req.ip;

    try {
        let loginAttempt = await AdminLoginAttempt.findOne({ username });
        
        // Check for locked account
        if (loginAttempt && loginAttempt.lockedUntil && loginAttempt.lockedUntil > new Date()) {
            const timeLeftMs = loginAttempt.lockedUntil - new Date();
            const minutes = Math.floor(timeLeftMs / (1000 * 60));
            const seconds = Math.ceil((timeLeftMs % (1000 * 60)) / 1000);
            const timeMessage = minutes > 0 
                ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds`
                : `${seconds} seconds`;
            
            return res.status(403).json({
                error: `Admin account temporarily locked. Please try again after ${timeMessage}.`
            });
        }

        // Validate credentials against admin collection
        const admin = await mongoose.connection.db.collection('admins').findOne({ username });
        const isValidCredentials = admin && await bcrypt.compare(password, admin.password);

        if (!isValidCredentials) {
            if (!loginAttempt) {
                loginAttempt = new AdminLoginAttempt({
                    username,
                    attempts: 1,
                    ipAddress
                });
            } else {
                loginAttempt.attempts += 1;
                
                if (loginAttempt.attempts >= 3) {
                    loginAttempt.lockedUntil = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
                    await loginAttempt.save();
                    return res.status(403).json({
                        error: 'Too many failed attempts. Account locked for 2 minutes.'
                    });
                }
            }
            await loginAttempt.save();
            return res.status(401).json({
                error: `Invalid admin credentials. ${3 - loginAttempt.attempts} attempts remaining.`
            });
        }

        if (loginAttempt) {
            loginAttempt.attempts = 0;
            loginAttempt.lockedUntil = null;
            await loginAttempt.save();
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;