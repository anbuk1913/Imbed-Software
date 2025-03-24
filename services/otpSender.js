const nodemailer = require('nodemailer')

const transpoter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_PASSWORD,
  },
})

module.exports = transpoter
