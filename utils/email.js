//sendgrid,mailgun
const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        //service:'Gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailoptions = {
        from: 'animeshagarwal282@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    };
    await transporter.sendMail(mailoptions);
}
module.exports = sendEmail;