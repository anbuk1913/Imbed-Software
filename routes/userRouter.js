const express = require("express")
const userController = require("../controller/userController")
const userAuth = require('../middleware/userAuth');
const router = express.Router()

router.get("/",userController.homePage)
router.get("/login",userController.loginPage)
router.post("/login",userController.loginPost)
router.get("/signup",userController.signUpPage)
router.post("/signup",userController.signUpPost)
router.get("/otpsend",userController.otpSend)
router.get("/otp",userController.otpPage)
router.post("/otp",userController.otpPost)
router.get("/blocked",userController.blockedUser)
router.post("/logout",userController.logout)

module.exports = router