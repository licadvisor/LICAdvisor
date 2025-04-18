const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Appointment = require('../models/Appointment');

// Add more detailed transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'licadvisormail@gmail.com',
        pass: 'giof pers wzie vwuk'
    },
    debug: false, // Enable debug logging
    logger: false // Enable built-in logger
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Transporter verification failed:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

router.post('/schedule', async (req, res) => {
    console.log('Raw request body:', req.body);
    
    // Get email from the correct field name
    const emailAddress = req.body['Email Address'] || req.body.emailAddress;
    const { name, phone, date, time, description } = req.body;

    console.log('Processed fields:', {
        name,
        emailAddress,
        phone,
        date,
        time,
        description
    });

    if (!name || !emailAddress || !phone || !date || !time) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields'
        });
    }

    try {
        // First save to database
        const appointment = new Appointment({
            name,
            emailAddress,
            phone,
            date,
            time,
            description
        });

        await appointment.save();
        console.log('Appointment saved to database:', appointment._id);

        // Then send emails
        const clientInfo = await transporter.sendMail({
            from: {
                name: 'LIC Advisor | MD TAIAB KHAN',
                address: 'licadvisormail@gmail.com'
            },
            to: emailAddress,
            subject: '⭐ LIC Advisor - Your Appointment Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #004d99; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #004d99; margin: 0;">Appointment Confirmation</h2>
                        <p style="color: #666; margin-top: 5px;">Thank you for choosing MD TAIAB KHAN | LIC Advisor Services </p>
                    </div>

                    <p style="color: #333;">Dear ${name} ,</p>
                    
                    <p style="color: #333;">We are pleased to confirm your consultation appointment with MD TAIAB KHAN, your dedicated LIC Advisor.</p>

                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #004d99; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Appointment Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${time}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Mode:</strong></td>
                                <td style="padding: 8px 0; color: #333;">Online/Phone Consultation</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Advisor:</strong></td>
                                <td style="padding: 8px 0; color: #333;">MD TAIAB KHAN (CM's Club Member)</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #004d99; margin-top: 0;">Important Information:</h4>
                        <ul style="color: #333; margin: 10px 0; padding-left: 20px;">
                            <li>Please keep this email for your records</li>
                            <li>Have your basic documents ready for discussion</li>
                            <li>Prepare any questions you may have about insurance policies</li>
                        </ul>
                    </div>

                    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #004d99;">
                        <p style="color: #666; margin: 0;">Need to reschedule or have questions?</p>
                        <p style="color: #333; margin: 5px 0;">Contact me at:</p>
                        <p style="color: #004d99; margin: 5px 0;">📧 licadvisormail@gmail.com</p>
                        <p style="color: #004d99; margin: 5px 0;">📞 +91 9064168537</p>
                    </div>

                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    
                    <div style="text-align: center; font-size: 12px; color: #666;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>© 2025 LIC Advisor Services. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        // Also send a notification to the admin
        // Admin notification email
        const adminInfo = await transporter.sendMail({
            from: {
                name: 'LIC Advisor System',
                address: 'licadvisormail@gmail.com'
            },
            to: 'licadvisormail@gmail.com , md.taiab.khan@gmail.com',
            subject: `🔔 New Appointment: ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #004d99; border-radius: 10px;">
                    <div style="text-align: center; background: #004d99; color: white; padding: 15px; border-radius: 8px;">
                        <h2 style="margin: 0;">New Appointment Alert</h2>
                        <p style="margin: 5px 0 0;">A new consultation has been scheduled</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #004d99; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Client Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Name:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Email:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">
                                        <a href="mailto:${emailAddress}" style="color: #004d99; text-decoration: none;">
                                            ${emailAddress}
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Phone:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">
                                        <a href="tel:+91${phone}" style="color: #004d99; text-decoration: none;">
                                            +91 ${phone}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #e8f4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="color: #004d99; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Appointment Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Date:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${date}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Time:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${time}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Description:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${description || 'No description provided'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <p style="color: #666; margin: 0;">Quick Actions</p>
                        <div style="margin-top: 10px;">
                            <a href="mailto:${emailAddress}" style="display: inline-block; margin: 5px; padding: 8px 15px; background: #004d99; color: white; text-decoration: none; border-radius: 5px;">
                                Reply to Client
                            </a>
                            <a href="tel:+91${phone}" style="display: inline-block; margin: 5px; padding: 8px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                                Call Client
                            </a>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                        <p>© 2025 LIC Advisor Services. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        console.log('Emails sent successfully:', {
            clientMessageId: clientInfo.messageId,
            adminMessageId: adminInfo.messageId
        });

        res.json({ 
            success: true,
            appointmentId: appointment._id,
            messageId: clientInfo.messageId
        });
    } catch (error) {
        console.error('Operation failed:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process appointment',
            details: error.message
        });
    }
});

// Add this test route
router.get('/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: 'licadvisormail@gmail.com',
            to: 'licadvisormail@gmail.com', // Send to yourself as a test
            subject: 'Test Email',
            text: 'If you receive this, the email service is working!'
        });
        res.send('Test email sent successfully!');
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).send('Failed to send test email: ' + error.message);
    }
});

// Add this new test route after your existing routes
router.get('/test-email/:email', async (req, res) => {
    try {
        console.log('Testing email to:', req.params.email);
        const info = await transporter.sendMail({
            from: {
                name: 'LIC Advisory',
                address: 'licadvisormail@gmail.com'
            },
            to: req.params.email,
            subject: 'Test Email from LIC Advisory',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Test Email</h2>
                    <p>This is a test email to verify the email service is working.</p>
                    <p>Time sent: ${new Date().toLocaleString()}</p>
                </div>
            `
        });
        console.log('Test email sent:', info);
        res.json({
            success: true,
            messageId: info.messageId,
            response: info.response
        });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
module.exports = router;