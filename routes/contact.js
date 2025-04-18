const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const transporter = require('../config/mail');

// Add a Map to store recent submissions
const recentSubmissions = new Map();

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Create a unique key for this submission
        const submissionKey = `${email}-${phone}-${subject}`;
        const now = Date.now();
        
        // Check if this is a duplicate submission within 10 seconds
        if (recentSubmissions.has(submissionKey)) {
            const lastSubmission = recentSubmissions.get(submissionKey);
            if (now - lastSubmission < 10000) { // 10 seconds
                return res.json({
                    success: false,
                    message: 'Your message was already submitted. Please wait before sending another.'
                });
            }
        }
        
        // Store this submission time
        recentSubmissions.set(submissionKey, now);
        
        // Clean up old submissions after 10 seconds
        setTimeout(() => {
            recentSubmissions.delete(submissionKey);
        }, 10000);

        console.log('Processing contact form submission:', { name, email, phone, subject });

        // Save to database
        const contact = new Contact({
            name,
            email,
            phone,
            subject,
            message,
            date: new Date()
        });

        await contact.save();
        console.log('Contact saved to database with ID:', contact._id);

        // Send admin notification email
        const emailInfo = await transporter.sendMail({
            from: {
                name: 'LIC Advisor Contact System',
                address: 'licadvisormail@gmail.com'
            },
            to: 'licadvisormail@gmail.com',
            subject: `📬 New Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #004d99; border-radius: 10px;">
                    <div style="text-align: center; background: #004d99; color: white; padding: 15px; border-radius: 8px;">
                        <h2 style="margin: 0;">New Contact Form Submission</h2>
                        <p style="margin: 5px 0 0;">A new message has been received</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #004d99; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Contact Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Name:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Email:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">
                                        <a href="mailto:${email}" style="color: #004d99; text-decoration: none;">
                                            ${email}
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
                                <tr>
                                    <td style="padding: 12px 0; color: #666;"><strong>Subject:</strong></td>
                                    <td style="padding: 12px 0; color: #333;">${subject}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #e8f4ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <h3 style="color: #004d99; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Message</h3>
                            <p style="color: #333; line-height: 1.6;">${message}</p>
                        </div>

                        <div style="background: #004d99; padding: 30px; border-radius: 8px; margin-top: 20px; text-align: center;">
                            <h3 style="color: white; margin: 0 0 25px 0; font-size: 22px;">Quick Response Tools</h3>
                            <div style="display: flex; justify-content: space-around; max-width: 400px; margin: 0 auto;">
                                <a href="tel:+91${phone}" style="display: inline-block; background: white; color: #004d99; text-decoration: none; padding: 20px; border-radius: 12px; width: 160px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <img src="https://img.icons8.com/ios-filled/50/004d99/phone.png" style="width: 30px; height: 30px; margin-bottom: 10px;">
                                    <div style="font-weight: bold; margin: 8px 0;">Call Now</div>
                                    <div style="font-size: 13px; color: #666;">+91 ${phone}</div>
                                </a>
                                <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: white; color: #004d99; text-decoration: none; padding: 20px; border-radius: 12px; width: 160px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <img src="https://img.icons8.com/ios-filled/50/004d99/mail.png" style="width: 30px; height: 30px; margin-bottom: 10px;">
                                    <div style="font-weight: bold; margin: 8px 0;">Reply Email</div>
                                    <div style="font-size: 13px; color: #666;">Quick Response</div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });

        console.log('Admin notification email sent:', emailInfo.messageId);
            
        res.json({ 
            success: true, 
            message: 'Thank you for your message. We will get back to you soon!',
            emailSent: true
        });
    } catch (error) {
        console.error('Contact form error:', error);
        
        // Check if we already saved to database but email failed
        if (error.emailError) {
            res.json({ 
                success: true, 
                message: 'Thank you for your message. We will get back to you soon!',
                emailSent: false
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to process your message. Please try again later.',
                error: error.message
            });
        }
    }
});

// Update the test email route
router.get('/test', async (req, res) => {
    try {
        const info = await transporter.sendMail({
            from: {
                name: 'LIC Advisor System',
                address: 'licadvisormail@gmail.com'
            },
            to: 'licadvisormail@gmail.com',
            subject: '✉️ Email System Test',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #004d99; border-radius: 10px;">
                    <h2 style="color: #004d99;">Email System Test</h2>
                    <p>This is a test email to verify the email system is working correctly.</p>
                    <p>Time sent: ${new Date().toLocaleString()}</p>
                </div>
            `
        });
        
        console.log('Test email sent successfully:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Test email sent successfully!',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

module.exports = router;