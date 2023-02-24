const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'raypubg12345@gmail.com',
        pass: 'choxmcvhgporchtw'
    }
});

module.exports = transporter;