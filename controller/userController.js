const bcrypt = require('bcrypt')
const offer = require("../model/offerModel")
const wallet = require("../model/walletModel");
const product = require("../model/productModel")
const category = require("../model/categoryModel");
const usercollection = require("../model/userModel");
const otpCollection = require("../model/otp");
const sendotp = require('../helper/sendOtp')
const passport = require('passport');
const AppError = require("../middleware/errorHandling")

async function encryptPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function comparePassword(enteredPassword, storedPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, storedPassword);
    return isMatch;
}

const homePage = async (req,res,next)=>{
    try{
        let name = ""
        const offers = await offer.find({})
        const products = await product.find({}).limit(4)
        const categories = await category.find({}).limit(5)
        for(let i of products){
            for(let j of offers){
                if(i.productCategoryId._id.toString() == j.categoryId.toString()){
                    const expiryDate = new Date(j.expiryDate);
                    const today = new Date();
                    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    if(expiryDate >= todayDateOnly){
                        const tem = Math.floor(i.productPrice-(i.productPrice*j.offerPercentage/100))
                        if(i.productOfferPrice && i.productOfferPrice > tem){
                            i.productOfferPrice = tem
                        } else {
                            i.productOfferPrice = tem
                        }
                    }
                    break
                }
            }
        }
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
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const loginPage = async(req,res,next)=>{
    try {
        if(req.session.loginSession || req.session.signupSession){
            return res.redirect("/")
        } else {
            const logErr = req.session.logError
            res.render("user/login",{logErr})
        } 
    } catch (error){
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const signUpPage = async(req,res,next)=>{
    try {
        if(req.session.loginSession || req.session.signupSession){
            return res.redirect("/")
        } else {
            const signErr =  req.session.signError
            res.render("user/signup",{signErr})
        }
    } catch (error){
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const otpSend = async(req,res,next)=>{
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

const otpPage = async(req,res,next)=>{
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


const otpPost = async(req,res,next)=>{
    const findOtp = await otpCollection.findOne({email:req.session.user.email})
    if(await comparePassword(req.body.otp,findOtp.otp)){
        const user = new usercollection({
            name: req.session.user.name,
            email: req.session.user.email,
            phone: req.session.user.phone,
            password: req.session.user.password
        });
        await user.save();
        const walletData = new wallet({
            userId: user._id
        })
        walletData.save()
        req.session.signupSession = true
        res.redirect("/")
    } else {
        req.session.otpError = "Incorrect OTP"
        res.redirect("/otp")
    }
}

const signUpPost = async(req,res,next)=>{
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
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const loginPost = async(req,res,next)=>{
    try{
        const userData = await usercollection.findOne({ email: req.body.email });
        if (userData) {
            if (userData.password && await comparePassword(req.body.password,userData.password)) {
              req.session.loginSession = true;
              req.session.user = {
                email:req.body.email
              }
              
              await wallet.updateOne(
                {userId: userData._id},
                {$set: {userId: userData._id} },
                {upsert:true, new :true});
              return res.status(200).send({ success: true })
            } else {
                return res.status(208).send({ success: false })
            }
        } else {
            return res.status(208).send({ success: false })
        }
    } catch (error) {
        console.log(error);
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const googleCallback=async (req, res) => {
    try {
      const user = await usercollection.findOneAndUpdate(
        { email: req.user._json.email},
        { $set: { name: req.user.displayName} },
        { upsert: true, new :true }
      );
      const userId = await usercollection.findOne({ email:req.user._json.email })
      const walletData = await wallet.updateOne(
        {userId: userId._id},
        {$set: {userId: userId._id} },
        {upsert:true, new :true});

      req.session.user = {
        email:req.user._json.email
      }
      // Set the user session
      req.session.loginSession = true
      // Redirect to the homepage
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(new AppError('Sorry...Something went wrong', 500));
    }
  } 


const blockedUser = async(req,res,next)=>{
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
    req.session.otpError = null
    req.session.checkOne = null
    req.session.firstName = null
    req.session.lastName = null
    req.session.phone = null
    req.session.email = null
    req.session.addressId = null
    req.session.doorNums = null
    req.session.street = null
    req.session.city = null
    req.session.district = null
    req.session.postcode = null
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