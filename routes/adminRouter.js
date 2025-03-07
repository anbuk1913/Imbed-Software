const express = require("express")
const adminAuth = require("../middleware/adminAuth")
const adminController = require("../controller/adminController")
const categoryController = require("../controller/categoryController")
const productController = require("../controller/productController")
const upload = require("../services/multer")
const orderController = require("../controller/orderController")
const couponController = require("../controller/couponController")
const offerController = require("../controller/offerController")
const salesReportController = require("../controller/salesReportController")
const router = express.Router()

//Admin
router.get("/admin",adminController.adminLog)
router.post("/adminVer",adminController.adminLogPost)
router.get("/admin/home",adminAuth,adminController.adminHome)
router.get("/admin/users",adminAuth,adminController.adminUser)
router.post("/user/list/:id",adminAuth,adminController.listUser)
router.post("/user/unlist/:id",adminAuth,adminController.unListUser)
router.get("/admin/top-products",adminAuth,adminController.topProduct)
router.get("/admin/top-category",adminAuth,adminController.topCategory)
router.put("/admin/dash/filter",adminAuth,adminController.timePeriodFilter)
router.put("/admin/dash/clearfilter",adminAuth,adminController.clearDashFilter)
router.put("/admin/dash/filter-by-date",adminAuth,adminController.dashBoardDateWiseFilter)
router.post("/adminlogout",adminController.logoutAdmin)

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

//Order
router.get("/admin/orders",adminAuth,orderController.adminOrderview)
router.get("/admin/orderview/:id",adminAuth,orderController.adminSingleOrderView)
router.get("/editorder/:id",adminAuth,orderController.adminEditOrder)
router.post("/orderupdate",adminAuth,orderController.adminEditOrderPost)
router.patch("/updateorder",adminAuth,orderController.editOrder)

//Coupon
router.get("/admin/coupon",adminAuth,couponController.couponPage)
router.post("/admin/addcoupon",adminAuth,couponController.addCoupon)
router.put("/admin/editcoupon",adminAuth,couponController.editCoupon)
router.delete("/deleteCoupon",adminAuth,couponController.deleteCoupon)

// Offer
router.get("/admin/offers",adminAuth,offerController.offerPage)
router.post("/admin/addoffer",adminAuth,offerController.addOffer)
router.put("/admin/editoffer",adminAuth,offerController.editOffer)

// Sales Report
router.get("/admin/salesreport",adminAuth,salesReportController.salesReportPage)
router.put("/admin/filter-by-date",adminAuth,salesReportController.filterByDate)
router.put("/admin/filter-plan",adminAuth,salesReportController.filterByTimePeriod)
router.put("/admin/clearfilter",adminAuth,salesReportController.clearFilter)
router.get("/admin/salesreport-pdf",adminAuth,salesReportController.generatePDFpage)
router.get("/admin/salesreport-xlsx",adminAuth,salesReportController.generateExcel)

module.exports = router