const express = require("express")
const adminController = require("../controller/adminController")
const router = express.Router()

router.get("/admin",adminController.adminGet)


module.exports = router