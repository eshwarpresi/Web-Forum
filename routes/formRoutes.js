const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const path = require('path');

// Reload dotenv to be safe
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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
        
        // Log received data (without sensitive info)
        console.log('Form Data:', { name, email: email ? '✓' : '✗', phone, company });

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill all required fields' 
            });
        }

        // ===== EMAIL 1: To Company (shivu@pasfreight.com) =====
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
                <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #4a90e2, #C850C0); padding: 30px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">📬 New Contact Form Submission</h1>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px; background: #f8f9fa; font-weight: bold; width: 120px; border-radius: 8px 0 0 8px;">Name:</td>
                                    <td style="padding: 12px; background: white; border: 1px solid #e9ecef; border-radius: 0 8px 8px 0;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background: #f8f9fa; font-weight: bold;">Email:</td>
                                    <td style="padding: 12px; background: white; border: 1px solid #e9ecef;"><a href="mailto:${email}" style="color: #4a90e2;">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background: #f8f9fa; font-weight: bold;">Phone:</td>
                                    <td style="padding: 12px; background: white; border: 1px solid #e9ecef;">${phone}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background: #f8f9fa; font-weight: bold;">Company:</td>
                                    <td style="padding: 12px; background: white; border: 1px solid #e9ecef;">${company || 'Not provided'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background: #f8f9fa; font-weight: bold; vertical-align: top;">Message:</td>
                                    <td style="padding: 12px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px;">
                                        ${message.replace(/\n/g, '<br>')}
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; color: #856404;">
                                <p style="margin: 0;"><strong>⏰ Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                <p style="margin: 10px 0 0 0;"><strong>🌐 IP:</strong> ${req.ip || req.connection.remoteAddress}</p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; margin: 0; font-size: 14px;">
                                PAS Freight Services Pvt Ltd<br>
                                Site No:171, Arkavathey Layout, 7th Block, Jakkur-BDA, Bangalore - 560092
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // ===== EMAIL 2: Auto-reply to Customer =====
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
                <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 40px 20px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px;">Thank You, ${name}! 🎉</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">We've received your enquiry</p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 30px;">
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear ${name},</p>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #333;">Thank you for reaching out to <strong>PAS Freight Services</strong>. We have received your enquiry and our team will get back to you within <strong>24 hours</strong>.</p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
                                <h3 style="color: #333; margin-top: 0; font-size: 18px;">📋 Your Enquiry Summary:</h3>
                                <p style="margin: 10px 0; color: #555;"><strong>Name:</strong> ${name}</p>
                                <p style="margin: 10px 0; color: #555;"><strong>Phone:</strong> ${phone}</p>
                                <p style="margin: 10px 0; color: #555;"><strong>Company:</strong> ${company || 'Not provided'}</p>
                                <p style="margin: 15px 0 5px 0; color: #555;"><strong>Message:</strong></p>
                                <p style="margin: 0; padding: 15px; background: white; border-radius: 8px; color: #333; border: 1px solid #dee2e6;">
                                    ${message.replace(/\n/g, '<br>')}
                                </p>
                            </div>
                            
                            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h3 style="color: #28a745; margin-top: 0; font-size: 18px;">📞 Need Immediate Assistance?</h3>
                                <p style="margin: 10px 0; color: #333;">Call us directly:</p>
                                <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #28a745;">+91 9071660066</p>
                                <p style="margin: 5px 0; font-size: 16px; color: #555;">+91 9164466664 | +91 9036101201</p>
                            </div>
                            
                            <div style="margin: 30px 0; text-align: center;">
                                <p style="font-size: 16px; color: #333;">Best regards,</p>
                                <p style="font-size: 18px; font-weight: bold; margin: 5px 0; color: #333;">Siva Prasad (SHIVU)</p>
                                <p style="font-size: 16px; color: #6c757d; margin: 0;">Managing Director</p>
                                <p style="font-size: 16px; color: #6c757d; margin: 5px 0;">
                                    <a href="mailto:shivu@pasfreight.com" style="color: #28a745;">shivu@pasfreight.com</a>
                                </p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
                            
                            <p style="font-size: 14px; color: #999; text-align: center; margin: 0;">
                                <strong>PAS Freight Services Pvt Ltd</strong><br>
                                Site No:171, Arkavathey Layout, 7th Block,<br>
                                Sy No: 90/3, Jakkur-BDA, Bangalore - 560092<br>
                                <a href="https://www.pasfreight.com" style="color: #28a745;">www.pasfreight.com</a>
                            </p>
                            
                            <p style="font-size: 12px; color: #ccc; text-align: center; margin-top: 20px;">
                                This is an automated response. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send both emails
        console.log('📧 Sending to company:', process.env.COMPANY_EMAIL);
        const companyInfo = await transporter.sendMail(companyMailOptions);
        console.log('✅ Company email sent. ID:', companyInfo.messageId);

        console.log('📧 Sending auto-reply to:', email);
        const userInfo = await transporter.sendMail(userMailOptions);
        console.log('✅ Auto-reply sent. ID:', userInfo.messageId);

        // Success response
        res.status(200).json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully. Please check your email for confirmation.'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'There was an error. Please call us at +91 9071660066'
        });
    }
});

module.exports = router;