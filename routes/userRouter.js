const express = require("express")
const userController = require("../controller/userController")
const userAuth = require('../middleware/userAuth');
const shopController = require('../controller/shopController')
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const profileController = require("../controller/profileController")
const router = express.Router()
const passport = require('passport');

//Landing Page & Authentication
router.get("/",userController.homePage)
router.get("/login",userController.loginPage)
router.post("/login",userController.loginPost)
router.get("/signup",userController.signUpPage)
router.post("/signup",userController.signUpPost)
router.get("/otpsend",userController.otpSend)
router.get("/otp",userController.otpPage)
router.post("/otp",userController.otpPost)
router.get('/auth/google', passport.authenticate('google',{scope:['email','profile']}))
router.get('/auth/google/callback', passport.authenticate('google',{failureRedirect:'http://localhost:3000/login'}),userController.googleCallback)
router.get("/blocked",userController.blockedUser)
router.post("/logout",userController.logout)

//Shop & Cart
router.get('/shop',shopController.shopPage)
router.get('/product/:id',productController.singleProductView)
router.get("/cart",userAuth,cartController.cartView)
router.post("/addcart",userAuth,cartController.addtoCart)
router.delete("/removeitem",userAuth,cartController.removeItem)

//Profile
router.get("/profile",userAuth,profileController.profile)
router.get("/address",userAuth,profileController.addressPage)
router.get("/addaddress",userAuth,profileController.addAddress)
router.post("/addaddress",userAuth,profileController.addAddressPost)
router.delete("/deleteaddress/:id",userAuth,profileController.deleteAddress)

module.exports = router