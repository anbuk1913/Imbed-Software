// const transpoter = require('../services/otpSender')
// const fs = require("fs")

// // Read HTML template
// const emailTemplate = fs.readFileSync('./views/admin/otp.html', 'utf8');

// // Replace placeholders with dynamic content




// let sendotp = async (otp,email) => {
    
//     const personalizedHtml = emailTemplate.replace('{{OTP}}', otp);
//     try {
//         await transpoter.sendMail({
//             from: "imbediot@gmail.com",
//             to: email,
//             subject: 'Testing',
//             html: personalizedHtml
//         })
//     } catch (err) {
//         console.log(err);
//     }
// }

// module.exports=sendotp

const transporter = require('../services/otpSender');
const fs = require("fs");
const path = require("path");

// Read HTML template
const emailTemplatePath = path.join(__dirname, '/../views/admin/otp.html');
const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

let sendOtp = async (otp, email) => {
    const personalizedHtml = emailTemplate.replace('{{OTP}}', otp);

    try {
        await transporter.sendMail({
            from: process.env.OTP_EMAIL, // Use email from environment variables
            to: email,
            subject: 'Your OTP Code',
            html: personalizedHtml,
        });
        console.log('OTP sent successfully!');
    } catch (err) {
        console.error('Failed to send OTP:', err.message);
        console.error('Error details:', err);
    }
};

module.exports = sendOtp;
