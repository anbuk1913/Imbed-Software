const express = require("express")
const adminAuth = require("../middleware/adminAuth")
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const router = express.Router()

//Admin
router.get("/admin",adminController.adminLog)
router.get("/adminhome",adminAuth,adminController.adminHome)
router.get("/adminusers",adminAuth,adminController.adminUser)
router.post("/adminVer",adminController.adminLogPost)

//Category
router.get("/admin/category",adminAuth, categoryController.categoryPage)
router.post("/addcategory",categoryController.addCategory)
router.post("/categories/list/:id",categoryController.listCategory)
router.post("/categories/unlist/:id",categoryController.listCategory)

module.exports = router