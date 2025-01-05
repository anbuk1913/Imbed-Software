const express = require("express")
const userController = require("../controller/userController")
const router = express.Router()

router.get("/",userController.homePage)
router.get("/login",userController.loginPage)
router.post("/login",userController.loginPost)
router.get("/signup",userController.signUpPage)
router.post("/signup",userController.signUpPost)
router.get("/otp",userController.otpPage)
router.get("/otpsend",userController.otpSend)
router.post("/otp",userController.otpPost)

module.exports = router