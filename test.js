require('dotenv').config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass exists:', !!process.env.EMAIL_PASS);
console.log('Company Email:', process.env.COMPANY_EMAIL);