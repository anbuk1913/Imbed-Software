const express = require("express")
const userController = require("../controller/userController")
const router = express.Router()

router.get("/",userController.homePage)
router.get("/login",userController.loginPage)

module.exports = router