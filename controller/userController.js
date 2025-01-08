const bcrypt = require('bcrypt')
const usercollection = require("../model/userModel");
const sendotp = require('../helper/sendOtp')

async function encryptPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function comparePassword(enteredPassword, storedPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, storedPassword);
    return isMatch;
}

const homePage = async (req,res)=>{
    let name=""
    if(req.session.loginSession || req.session.signupSession){
        const uEmail = req.session.user.email
        userVer = await usercollection.findOne({ email: uEmail });
        if(userVer){
            if(userVer.isActive == false){
                req.session.block = true
                return res.redirect("/blocked")
            } else {
                name = userVer.name
                return res.render("user/home",{name})
            }
        } else {
            return res.render("user/home",{name})
        }
    } else {
        return res.render("user/home",{name})
    }
}

const loginPage = async(req,res)=>{
    try {
        if(req.session.loginSession || req.session.signupSession){
            return res.redirect("/")
        } else {
            const logErr = req.session.logError
            res.render("user/login",{logErr})
        } 
    } catch (error){
        console.log(error)
    }
}

const signUpPage = async(req,res)=>{
    try {
        if(req.session.loginSession || req.session.signupSession){
            return res.redirect("/")
        } else {
            const signErr =  req.session.signError
            res.render("user/signup",{signErr})
        }
    } catch (error){
        console.log(error)
    }
}

const otpSend = async(req,res)=>{
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    req.session.otp = generatedOtp
    req.session.otpError = null
    if (!req.session.otpTime) {  // Check if otpTime is not set
        req.session.otpTime = 75;  // Set it only if it's not already set
    }
    sendotp(generatedOtp,req.session.user.email,req.session.user.name)
    res.redirect("/otp")
}

const otpPage = async(req,res)=>{
    const otpError = req.session.otpError
    const countdown = setInterval(() => {
        if (req.session.otpTime > 0) {
            req.session.otpTime-=1;
        } else {
            req.session.otpTime = 0
            clearInterval(countdown)
        }
    }, 1000);
    const time = req.session.otpTime
    res.render("user/otp",{otpError:otpError,time:time})
}


const otpPost = async(req,res)=>{
    if(req.body.otp==req.session.otp){
        const user = new usercollection({
            name: req.session.user.name,
            email: req.session.user.email,
            phone: req.session.user.phone,
            password: req.session.user.password
        });
        await user.save();
        req.session.signupSession = true
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
        req.session.user=user
        req.session.signup = true;
        res.redirect("/otpsend");
    }
}

const loginPost = async(req,res)=>{
    try{
        const userData = await usercollection.findOne({ email: req.body.email });
        if (userData) {
            if (await comparePassword(req.body.password,userData.password)) {
              req.session.loginSession = true;
              req.session.user = {
                email:req.body.email
              }
              res.redirect("/");
            } else {
              req.session.logError = "Incorrect Email or Password";
              res.redirect("/login");
            }
          } else {
            req.session.logError = "Incorrect Email or Password";
            res.redirect("/login");
          }
    } catch (error) {
        console.log(error);
    }
}

const blockedUser = async(req,res)=>{
    if(req.session.block){
        return res.render("user/blockedUser")
    } else {
        return res.redirect("/")
    }
}

const logout = async(req,res)=>{
    req.session.destroy()
    return res.redirect('/')
}

module.exports = {homePage,loginPage,signUpPage,otpPage,signUpPost,otpPost,otpSend,loginPost,blockedUser,logout}