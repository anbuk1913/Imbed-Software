const bcrypt = require('bcrypt')
const usercollection = require("../model/userModel");
const sendotp = require('../helper/sendOtp')

async function encryptPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const homePage = async (req,res)=>{
    res.render("user/home")
}

const loginPage = async(req,res)=>{
    try {
        const logErr = req.session.logError
        res.render("user/login",{logErr})
    } catch (error){
        console.log(error)
    }
}

const signUpPage = async(req,res)=>{
    try {
        const signErr =  req.session.signError
        res.render("user/signup",{signErr})
    } catch (error){
        console.log(error)
    }
    
}

const otpPage = async(req,res)=>{
    const otpError = req.session.otpError
    res.render("user/otp",{otpError})
}

const otpSend = async(req,res)=>{
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    req.session.otp = generatedOtp
    sendotp(generatedOtp,req.session.user.email)
    res.redirect("/otp")
}

const otpPost = async(req,res)=>{
    if(req.body.otp==req.session.otp){
        res.redirect("/")
    } else {
        req.session.otpError = "Incorrect OTP"
        res.redirect("/otp")
    }
}

const signUpPost = async(req,res)=>{
    const hashedPassword = await encryptPassword(req.body.password)
    const user = new usercollection({
        name: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword
    });
    const userExists = await usercollection.findOne({ email: req.body.email });
    if (userExists) {
        req.session.signError = "Email already Exits!";
        res.redirect("/signup");
    } else {
        req.session.signup = true;
        req.session.user=user
        req.session.signup = true;
        res.redirect("/otpsend");
    }
}

module.exports = {homePage,loginPage,signUpPage,otpPage,signUpPost,otpPost,otpSend}