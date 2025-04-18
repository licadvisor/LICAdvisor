const cryptoRandomString = require('crypto-random-string');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const generateVerificationCode = () => {
    return cryptoRandomString({length: 6, type: 'numeric'});
};

const verificationController = {
    sendVerificationCode: async (req, res) => {
        try {
            const { email } = req.body;
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.verificationCode = verificationCode;
            await user.save();

            // Create test account using Ethereal
            const testAccount = await nodemailer.createTestAccount();

            // Create transporter with Ethereal credentials
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            const info = await transporter.sendMail({
                from: '"LIC Advisor" <support@licadvisor.com>',
                to: email,
                subject: 'Email Verification Code',
                html: `Your verification code is: <strong>${verificationCode}</strong>`
            });

            // Log the test email URL (for development)
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));

            res.json({ 
                message: 'Verification code sent successfully',
                previewUrl: nodemailer.getTestMessageUrl(info) // Remove this in production
            });
        } catch (error) {
            console.error('Verification code error:', error);
            res.status(500).json({ message: 'Error sending verification code' });
        }
    },

    verifyCode: async (req, res) => {
        try {
            const { email, code } = req.body;
            
            const user = await User.findOne({ 
                email,
                verificationCode: code
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }

            user.isVerified = true;
            user.verificationCode = undefined;
            await user.save();

            res.json({ 
                success: true,
                message: 'Email verified successfully' 
            });
        } catch (error) {
            console.error('Code verification error:', error);
            res.status(500).json({ message: 'Error verifying code' });
        }
    }
};

module.exports = verificationController;