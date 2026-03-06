const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// No need for dotenv here - it's already loaded in server.js
console.log('📧 Form routes loaded');
console.log('Email User:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing');

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Transporter Error:', error.message);
    } else {
        console.log('✅ Email server is ready');
        console.log('📧 Sending from:', process.env.EMAIL_USER);
        console.log('📧 Sending to:', process.env.COMPANY_EMAIL);
    }
});

// Handle form submission
router.post('/submit-form', async (req, res) => {
    console.log('📝 Form submission received at:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    
    try {
        const { name, email, phone, company, message } = req.body;
        
        console.log('Form Data:', { name, email: email ? '✓' : '✗', phone, company });

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill all required fields' 
            });
        }

        // Email to Company
        const companyMailOptions = {
            from: `"PAS Freight Website" <${process.env.EMAIL_USER}>`,
            to: process.env.COMPANY_EMAIL,
            subject: `🔔 New Website Enquiry from ${name}`,
            html: `...` // Keep your existing HTML template
        };

        // Auto-reply to Customer
        const userMailOptions = {
            from: `"PAS Freight Services" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting PAS Freight Services',
            html: `...` // Keep your existing HTML template
        };

        console.log('📧 Sending to company:', process.env.COMPANY_EMAIL);
        const companyInfo = await transporter.sendMail(companyMailOptions);
        console.log('✅ Company email sent. ID:', companyInfo.messageId);

        console.log('📧 Sending auto-reply to:', email);
        const userInfo = await transporter.sendMail(userMailOptions);
        console.log('✅ Auto-reply sent. ID:', userInfo.messageId);

        res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully.'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending message. Please try again.'
        });
    }
});

module.exports = router;