const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'licadvisormail@gmail.com',
        pass: 'giof pers wzie vwuk'  // Replace with your actual App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test the connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

module.exports = transporter;