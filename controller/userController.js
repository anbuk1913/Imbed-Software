const bcrypt = require('bcrypt')
const product = require("../model/productModel")
const category = require("../model/categoryModel");
const usercollection = require("../model/userModel");
const otpCollection = require("../model/otp");
const sendotp = require('../helper/sendOtp')
const passport = require('passport');

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
    try{
        let name = ""
        const products = await product.find({}).limit(4)
        const categories = await category.find({}).limit(5)
        if(req.session.loginSession || req.session.signupSession){
            const userEmail = req.session.user.email
            const userVer = await usercollection.findOne({ email: userEmail });
            if(userVer){
                req.session.otpSession = false
                if(!userVer.isActive){
                    return res.redirect("/blocked")
                } else {
                    name = userVer.name
                    return res.render("user/home",{name,products,categories})
                }
            } else {
                return res.render("user/home",{name,products,categories})
            }
        } else {
            return res.render("user/home",{name,products,categories})
        }
    }catch(error) {
        console.log(error)
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
    req.session.otpSession = true
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    req.session.otpError = null
    req.session.otpTime = 75;  // Set it only if it's not already set
    sendotp(generatedOtp,req.session.user.email,req.session.user.name)
    const hashedOtp = await encryptPassword(generatedOtp)
    await otpCollection.updateOne({email:req.session.user.email},{$set:{otp:hashedOtp}},{upsert:true})
    req.session.otpStartTime = null
    res.redirect("/otp")
}

const otpPage = async(req,res)=>{
    if(req.session.otpSession){
        const otpError = req.session.otpError
        // If OTP time isn't set, set it
        if (!req.session.otpStartTime) {
            req.session.otpStartTime = Date.now();
        }
        const elapsedTime = Math.floor((Date.now() - req.session.otpStartTime) / 1000);
        const remainingTime = Math.max(req.session.otpTime - elapsedTime, 0);
        return res.render("user/otp",{otpError:otpError,time:remainingTime})
    } else {
        return res.redirect("/")
    }
} 


const otpPost = async(req,res)=>{
    const findOtp = await otpCollection.findOne({email:req.session.user.email})
    if(await comparePassword(req.body.otp,findOtp.otp)){
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
    try{
        const userExists = await usercollection.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(409).send({ success: false });
        } else {
            const hashedPassword = await encryptPassword(req.body.password)
            const user = new usercollection({
                name: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: hashedPassword
            });
            req.session.user=user
            return res.status(200).send({ success: true });
        }
    } catch (error){
        console.error("Signup error:", error);
        return res.status(500).send({ success: false, message: "Server error" });
    }
}

const loginPost = async(req,res)=>{
    try{
        const userData = await usercollection.findOne({ email: req.body.email });
        if (userData) {
            if (userData.password && await comparePassword(req.body.password,userData.password)) {
              req.session.loginSession = true;
              req.session.user = {
                email:req.body.email
              }
              return res.status(200).send({ success: true })
            } else {
                return res.status(208).send({ success: false })
            }
          } else {
            return res.status(208).send({ success: false })
          }
    } catch (error) {
        console.log(error);
    }
}

const googleCallback=async (req, res) => {
    try {
      const user = await usercollection.findOneAndUpdate(
        { email: req.user._json.email},
        { $set: { name: req.user.displayName} },
        { upsert: true,new :true }
      );
  
      req.session.user = {
        email:req.user._json.email
      }
      // Set the user session
      req.session.loginSession=true
      // Redirect to the homepage
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  } 


const blockedUser = async(req,res)=>{
    const user = await usercollection.findOne({ email: req.session.user.email })
    if(user.isActive == false){
        return res.render("user/blockedUser")
    } else {
        return res.redirect("/")
    }
}


const logout = async(req,res)=>{
    req.session.loginSession = null
    req.session.signupSession = null
    req.session.user = null
    req.session.logError = null
    req.session.signError = null
    req.session.otp = null
    req.session.otpError = null
    req.session.checkOne = null
    return res.redirect('/')
}


module.exports = {
    homePage,
    loginPage,
    signUpPage,
    otpPage,
    signUpPost,
    otpPost,
    otpSend,
    loginPost,
    googleCallback,
    blockedUser,
    logout,
}