const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const nodemailer = require('nodemailer');

// Use your existing email configuration from customerRoutes.js
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'licadvisormail@gmail.com',
        pass: 'giof pers wzie vwuk'
    }
});

// Newsletter subscription route
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // First try to save to database
        try {
            const subscriber = new Newsletter({
                email: email,
                subscribed: true,
                subscribedAt: new Date()
            });
            
            await subscriber.save();
            console.log('Subscriber saved successfully:', email);
        } catch (dbError) {
            console.error('Database error:', dbError);
            // Check if it's a duplicate key error
            if (dbError.code === 11000) {
                // Email already exists, continue with sending welcome email
                console.log('Email already subscribed:', email);
            } else {
                throw dbError; // Re-throw other database errors
            }
        }

        // Proceed with sending email
        await transporter.sendMail({
            from: {
                name: 'LIC Advisor | MD TAIAB KHAN',
                address: 'licadvisormail@gmail.com'
            },
            to: email,
            subject: '🌟 Welcome to LIC Advisor Newsletter!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: white; border-radius: 16px; padding: 40px 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <img src="/images/lic-logo.png" alt="LIC Advisor" style="width: 150px; height: auto;">
                            </div>

                            <!-- Welcome Message -->
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 15px;">Thank You for Subscribing!</h1>
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">Welcome to our exclusive newsletter community!</p>
                            </div>

                            <!-- Benefits -->
                            <div style="color: #444; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                <h2 style="color: #004d99; font-size: 20px;">What you'll receive:</h2>
                                <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                                    <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                        <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                        Latest LIC policy updates and launches
                                    </li>
                                    <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                        <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                        Exclusive offers and discounts
                                    </li>
                                    <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                        <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                        Financial planning tips and insights
                                    </li>
                                    <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                        <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                        Investment strategies and market updates
                                    </li>
                                </ul>
                            </div>

                            <!-- Contact Information -->
                            <div style="background: #fff4e5; border-radius: 12px; padding: 20px; margin: 30px 0;">
                                <h3 style="color: #ff9800; margin: 0 0 15px;">📞 Need Assistance?</h3>
                                <p style="margin: 0;">
                                    Contact your LIC Advisor:<br>
                                    Phone: <a href="tel:+919064168537" style="color: #004d99; text-decoration: none;">+91 9064168537</a><br>
                                    WhatsApp: <a href="https://wa.me/919064168537" style="color: #004d99; text-decoration: none;">+91 9064168537</a><br>
                                    Email: <a href="mailto:licadvisormail@gmail.com" style="color: #004d99; text-decoration: none;">licadvisormail@gmail.com</a>
                                </p>
                            </div>

                            <!-- Unsubscribe Notice -->
                            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                <p style="color: #666; font-size: 12px; margin: 0;">
                                    If you wish to unsubscribe, <a href="https://licadvisor.com/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #004d99; text-decoration: none;">click here</a>
                                </p>
                            </div>

                            <!-- Footer -->
                            <div style="text-align: center; margin-top: 20px;">
                                <p style="color: #666; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} LIC Advisor. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        res.json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again.'
        });
    }
});

// Unsubscribe route
router.get('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.query;
        
        await Newsletter.findOneAndUpdate(
            { email },
            { subscribed: false, unsubscribedAt: new Date() }
        );

        res.render('newsletter/unsubscribe-success', { layout: false });

    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).send('Failed to unsubscribe. Please try again.');
    }
});

module.exports = router;