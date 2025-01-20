const express = require("express")
const adminAuth = require("../middleware/adminAuth")
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const productController = require("../controller/productController")
const upload = require("../services/multer")
const router = express.Router()

//Admin
router.get("/admin",adminController.adminLog)
router.get("/adminhome",adminAuth,adminController.adminHome)
router.get("/adminusers",adminAuth,adminController.adminUser)
router.post("/adminVer",adminController.adminLogPost)
router.post("/user/list/:id",adminController.listUser)
router.post("/user/unlist/:id",adminController.unListUser)

//Category
router.get("/admin/category",adminAuth, categoryController.categoryPage)
router.post("/addcategory",categoryController.addCategory)
router.post("/categories/list/:id",categoryController.listCategory)
router.post("/categories/unlist/:id",categoryController.unListCategory)
router.put("/categories/edit",categoryController.editCategory)

//Product
router.get("/admin/product",adminAuth,productController.productPage)
router.get("/admin/addproduct",adminAuth,productController.addProduct)
router.post('/addProduct', upload.fields([{ name: 'productImage1', maxCount: 1 }, { name: 'productImage2', maxCount: 1 }, { name: 'productImage3', maxCount: 1 }]), productController.addProductPost);
router.get("/product/edit/:id",adminAuth,productController.productEdit)
router.post("/product/edit",upload.fields([{ name: 'productImage1', maxCount: 1 }, { name: 'productImage2', maxCount: 1 }, { name: 'productImage3', maxCount: 1 }]),productController.productEditPost)
router.delete("/deleteproduct",productController.deleteProduct)
router.post("/product/list/:id",productController.listProduct)
router.post("/product/unlist/:id",productController.unListProduct)

module.exports = router