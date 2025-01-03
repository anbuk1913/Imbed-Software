const express = require("express")
const userController = require("../controller/userController")
const router = express.Router()

router.get("/",userController.homePage)
router.get("/login",userController.loginPage)
router.get("/signup",userController.signUpPage)
router.get("/otp",userController.otpPage)


module.exports = router