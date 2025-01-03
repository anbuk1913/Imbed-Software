const express = require("express")
const adminController = require("../controller/adminController")
const router = express.Router()

router.get("/admin",adminController.adminLog)
router.get("/adminhome",adminController.adminHome)
router.get("/adminusers",adminController.adminUser)
router.post("/adminVer",adminController.adminLogPost)


module.exports = router