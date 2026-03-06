// Load environment variables FIRST - only once!
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug - verify environment is loaded
console.log('🔧 Environment Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');
console.log('COMPANY_EMAIL:', process.env.COMPANY_EMAIL ? '✅ Loaded' : '❌ Missing');
console.log('PORT:', process.env.PORT || '3000 (default)');

const express = require('express');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting to prevent spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', limiter);

// Routes
app.use('/', formRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        time: new Date().toISOString(),
        email: process.env.EMAIL_USER ? 'configured' : 'not configured'
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).send('Something went wrong!');
});

// Start server - listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email system ready to send messages`);
    console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});