var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: (process.env.MAIL_PORT == 465) ? true : false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

module.exports = transporter;