const express = require("express")
const userController = require("../controller/userController")
const userAuth = require('../middleware/userAuth');
const shopController = require('../controller/shopController')
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const router = express.Router()
const passport = require('passport');

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
router.get('/shop',shopController.shopPage)
router.get('/product/:id',productController.singleProductView)
router.get("/profile",userAuth,userController.profile)
router.get("/cart",userAuth,cartController.cartView)
router.post("/addcart",userAuth,cartController.addtoCart)
router.get("/blocked",userController.blockedUser)
router.post("/logout",userController.logout)

module.exports = router