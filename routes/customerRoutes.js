const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const nodemailer = require('nodemailer');

// Update the mail configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'licadvisormail@gmail.com',
        pass: 'giof pers wzie vwuk'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter
transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// GET route for register page
router.get('/register', (req, res) => {
    res.render('customer/register', { layout: false });
});

// POST route for registration
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !phone || !password) {
            return res.json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists - Email check
        const existingEmail = await Customer.findOne({ email });
        if (existingEmail) {
            console.log('Registration failed: Email already exists -', email);
            return res.json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Check if user already exists - Phone check
        const existingPhone = await Customer.findOne({ phone });
        if (existingPhone) {
            console.log('Registration failed: Phone already exists -', phone);
            return res.json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Store registration data in session
        req.session.pendingRegistration = {
            fullName,
            email,
            phone,
            password,
            timestamp: Date.now()
        };

        // Trigger OTP send
        const otp = Math.floor(100000 + Math.random() * 900000);
        req.session.registrationOTP = {
            code: otp,
            email: email,
            timestamp: Date.now(),
            attempts: 0
        };

        // Send OTP email
// Update the email template in both /register and /send-otp routes
await transporter.sendMail({
    from: {
        name: 'LIC Advisor | MD TAIAB KHAN',
        address: 'licadvisormail@gmail.com'
    },
    to: email,
    subject: '🔐 Verify Your Email Address',
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

                    <!-- Greeting -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px;">Verify Your Email Address</h1>
                        <p style="color: #666; font-size: 16px; margin: 0;">Hi ${fullName},</p>
                        <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 10px 0;">
                            Thanks for getting started with LIC Advisor | MD TAIAB KHAN ! Please use the verification code below to complete your registration.
                        </p>
                    </div>

                    <!-- OTP Box -->
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px; margin: 0 0 15px;">Your verification code is:</p>
                        <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #004d99; background: white; padding: 15px; border-radius: 8px; margin: 0 auto; display: inline-block;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 12px; margin: 15px 0 0;">Code expires in 10 minutes</p>
                    </div>

                    <!-- Security Notice -->
                    <div style="background: #fff4e5; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                            If you didn't request this code, you can safely ignore this email.
                        </p>
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
            requireOTP: true,
            message: 'Please verify your email address'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Update verify-otp route
router.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        const storedOTP = req.session.registrationOTP;
        const pendingRegistration = req.session.pendingRegistration;

        if (!storedOTP || !pendingRegistration) {
            return res.json({ success: false, message: 'Registration session expired. Please try again.' });
        }

        // Check if OTP is expired (10 minutes)
        if (Date.now() - storedOTP.timestamp > 600000) {
            delete req.session.registrationOTP;
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        // Verify OTP
        // Add this function before module.exports
        const sendWelcomeEmail = async (customer) => {
            setTimeout(async () => {
                try {
                    await transporter.sendMail({
                        from: {
                            name: 'LIC Advisor | MD TAIAB KHAN',
                            address: 'licadvisormail@gmail.com'
                        },
                        to: customer.email,
                        subject: '🎉 Welcome to LIC Advisor - Your Financial Security Partner',
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
                                            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0 0 15px;">Welcome to the LIC Family!</h1>
                                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">Dear ${customer.name},</p>
                                        </div>

                                        <!-- Main Content -->
                                        <div style="color: #444; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                            <p>I'm MD TAIAB KHAN, your dedicated LIC advisor, and I'm thrilled to welcome you to our family. Thank you for choosing us as your financial security partner. Your trust means everything to us.</p>
                                            
                                            <p>As your personal LIC advisor, I'm here to help you:</p>
                                            <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
                                                <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                                    <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                                    Secure your family's financial future
                                                </li>
                                                <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                                    <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                                    Plan for your children's education
                                                </li>
                                                <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                                    <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                                    Create a comfortable retirement plan
                                                </li>
                                                <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                                                    <span style="color: #004d99; position: absolute; left: 0;">✓</span>
                                                    Maximize your tax savings
                                                </li>
                                            </ul>

                                            <!-- Special Offer -->
                                            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 30px 0;">
                                                <h3 style="color: #004d99; margin: 0 0 15px;">🎁 Special Welcome Offer</h3>
                                                <p style="margin: 0;">Schedule a free consultation within the next 7 days and receive a personalized financial planning report worth ₹1,999 absolutely free!</p>
                                            </div>

                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin: 30px 0;">
                                                <a href="https://licadvisor.com/schedule" style="background-color: #004d99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Schedule Free Consultation</a>
                                            </div>

                                            <!-- Contact Information -->
                                            <div style="background: #fff4e5; border-radius: 12px; padding: 20px; margin: 30px 0;">
                                                <h3 style="color: #ff9800; margin: 0 0 15px;">📞 Need Immediate Assistance?</h3>
                                                <p style="margin: 0;">
                                                    Feel free to reach out:<br>
                                                    Phone: <a href="tel:+919064168537" style="color: #004d99; text-decoration: none;">+91 9064168537</a><br>
                                                    WhatsApp: <a href="https://wa.me/919064168537" style="color: #004d99; text-decoration: none;">+91 9064168537</a><br>
                                                    Email: <a href="mailto:licadvisormail@gmail.com" style="color: #004d99; text-decoration: none;">licadvisormail@gmail.com</a>
                                                </p>
                                            </div>
                                        </div>

                                        <!-- Footer -->
                                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                            <p style="color: #666; font-size: 14px; margin: 0 0 10px;">
                                                Best Regards,<br>
                                                <strong>MD TAIAB KHAN</strong><br>
                                                CM's Club Member , LIC Advisor
                                            </p>
                                            <p style="color: #666; font-size: 12px; margin: 20px 0 0;">
                                                © ${new Date().getFullYear()} LIC Advisor. All rights reserved.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    });
                    console.log('Welcome email sent to:', customer.email);
                } catch (error) {
                    console.error('Error sending welcome email:', error);
                }
            }, 12000); // 2 minute delay
        };
        
        // Update the verify-otp route to include welcome email
        // Find this section in the verify-otp route where registration is successful
        if (storedOTP.code.toString() === otp) {
            const hashedPassword = await bcrypt.hash(pendingRegistration.password, 10);
            const customer = new Customer({
                name: pendingRegistration.fullName,
                email: pendingRegistration.email,
                phone: pendingRegistration.phone,
                password: hashedPassword
            });
        
            await customer.save();
            console.log('Registration successful for:', pendingRegistration.email);
        
            // Send welcome email
            sendWelcomeEmail(customer);
        
            // Clear registration session data
            delete req.session.registrationOTP;
            delete req.session.pendingRegistration;
        
            return res.json({ 
                success: true, 
                message: 'Registration successful! Please login.',
                redirectToLogin: true
            });
        }

        // Increment attempts
        storedOTP.attempts++;
        if (storedOTP.attempts >= 3) {
            delete req.session.registrationOTP;
            return res.json({ success: false, message: 'Too many invalid attempts. Please request a new OTP.' });
        }

        res.json({ success: false, message: 'Invalid verification code' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});
// Add this route after your register routes
router.get('/login', (req, res) => {
    res.render('customer/login', { layout: false });
});
// Add this route after your existing routes
// In the login POST route, update the success response
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, customer.password);
        if (!isValidPassword) {
            return res.json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Set session
        req.session.customerId = customer._id;
        req.session.customerEmail = customer.email;

        // Handle remember me
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.json({
            success: true,
            message: 'Login successful',
            redirectUrl: '/customer/dashboard', // Add this line
            userName: customer.name // Add this for the popup
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});
// Add after your login routes
router.get('/dashboard', async (req, res) => {
    // Check if user is logged in
    if (!req.session.customerId) {
        return res.redirect('/customer/login');
    }
    
    try {
        const customer = await Customer.findById(req.session.customerId);
        if (!customer) {
            req.session.destroy();
            return res.redirect('/customer/login');
        }
        
        res.render('customer/dashboard', {
            layout: false,
            customer: customer
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.redirect('/customer/login');
    }
});
// Add these routes for OTP handling
// Update the send-otp route
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        // Store OTP in session
        req.session.registrationOTP = {
            code: otp,
            email: email,
            timestamp: Date.now(),
            attempts: 0
        };

        // Send OTP email
        // Update the email template in both /register and /send-otp routes
await transporter.sendMail({
    from: {
        name: 'LIC Advisor | MD TAIAB KHAN',
        address: 'licadvisormail@gmail.com'
    },
    to: email,
    subject: '🔐 Verify Your Email Address',
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

                    <!-- Greeting -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 10px;">Verify Your Email Address</h1>
                        <p style="color: #666; font-size: 16px; margin: 0;">Hi ${fullName},</p>
                        <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 10px 0;">
                            Thanks for getting started with LIC Advisor | MD TAIAB KHAN ! Please use the verification code below to complete your registration.
                        </p>
                    </div>

                    <!-- OTP Box -->
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px; margin: 0 0 15px;">Your verification code is:</p>
                        <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #004d99; background: white; padding: 15px; border-radius: 8px; margin: 0 auto; display: inline-block;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 12px; margin: 15px 0 0;">Code expires in 10 minutes</p>
                    </div>

                    <!-- Security Notice -->
                    <div style="background: #fff4e5; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #666; font-size: 14px; margin: 0;">
                            <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                            If you didn't request this code, you can safely ignore this email.
                        </p>
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

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

router.post('/verify-otp', (req, res) => {
    try {
        const { otp } = req.body;
        const storedOTP = req.session.registrationOTP;

        if (!storedOTP) {
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        // Check if OTP is expired (10 minutes)
        if (Date.now() - storedOTP.timestamp > 600000) {
            delete req.session.registrationOTP;
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        // Verify OTP
        if (storedOTP.code.toString() === otp) {
            req.session.emailVerified = storedOTP.email;
            delete req.session.registrationOTP;
            return res.json({ success: true, message: 'Email verified successfully' });
        }

        // Increment attempts
        storedOTP.attempts++;
        if (storedOTP.attempts >= 3) {
            delete req.session.registrationOTP;
            return res.json({ success: false, message: 'Too many invalid attempts. Please request a new OTP.' });
        }

        res.json({ success: false, message: 'Invalid verification code' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});
module.exports = router;