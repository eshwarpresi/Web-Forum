const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

console.log('📧 Form routes loaded');
console.log('Email User:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing');
console.log('Email Pass:', process.env.EMAIL_PASS ? '✅ Configured' : '❌ Missing');
console.log('Company Email:', process.env.COMPANY_EMAIL ? '✅ Configured' : '❌ Missing');

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
    },
    debug: true, // Enable debug logs
    logger: true // Log to console
});

// Verify transporter on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Transporter Error Details:');
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Error response:', error.response);
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
        
        console.log('Form Data:', { name, email, phone, company });

        // Validate required fields
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
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <div style="background: linear-gradient(135deg, #004E98, #FF6B35); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0;">📬 New Contact Form Submission</h1>
                        </div>
                        <div style="padding: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 10px; background: #f8f9fa; font-weight: bold;">Name:</td><td style="padding: 10px;">${name}</td></tr>
                                <tr><td style="padding: 10px; background: #f8f9fa; font-weight: bold;">Email:</td><td style="padding: 10px;">${email}</td></tr>
                                <tr><td style="padding: 10px; background: #f8f9fa; font-weight: bold;">Phone:</td><td style="padding: 10px;">${phone}</td></tr>
                                <tr><td style="padding: 10px; background: #f8f9fa; font-weight: bold;">Company:</td><td style="padding: 10px;">${company || 'Not provided'}</td></tr>
                                <tr><td style="padding: 10px; background: #f8f9fa; font-weight: bold;">Message:</td><td style="padding: 10px;">${message}</td></tr>
                            </table>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Auto-reply to Customer
        const userMailOptions = {
            from: `"PAS Freight Services" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting PAS Freight Services',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 40px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Thank You, ${name}!</h1>
                        </div>
                        <div style="padding: 30px;">
                            <p>Dear ${name},</p>
                            <p>Thank you for contacting <strong>PAS Freight Services</strong>. We have received your enquiry and will respond within 24 hours.</p>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3>Your Message:</h3>
                                <p>${message}</p>
                            </div>
                            <p>Best regards,<br><strong>PAS Freight Services</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `
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
        console.error('❌ Error Details:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Response:', error.response);
        
        res.status(500).json({ 
            success: false, 
            message: 'Error sending message. Please try again.'
        });
    }
});

// Add test endpoint
router.get('/test-email', async (req, res) => {
    try {
        const testMail = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test from Vercel',
            text: 'If you receive this, email is working!'
        };
        const info = await transporter.sendMail(testMail);
        res.json({ success: true, message: 'Test email sent!', messageId: info.messageId });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;