const usercollection = require("../model/userModel")
const product = require("../model/productModel")
const category = require("../model/categoryModel");
const dashboardHelper = require("../helper/dashboardHelper")
const AppError = require("../middleware/errorHandling")

const adminLog = async(req,res,next)=>{
    if(req.session.adminVer){
        return res.redirect("/admin/home")
    } else {
        const adminError = req.session.adminError
        return res.render("admin/login",{adminError})
    }
} 

const adminHome = async (req,res,next)=>{
    try {
        const [
            completedOrders,
            ordersToShip,
            todayIncome,
            productCount,
            totalRevenue,
            monthlyRevenue,
            activeUsers,
            categoryRevenue,
            salesData
        ] = await Promise.all([
            dashboardHelper.completedOrders(req.session.dashboardStart,req.session.dashboardEnd),
            dashboardHelper.ordersToShip(req.session.dashboardStart,req.session.dashboardEnd),
            dashboardHelper.todayIncome(),
            dashboardHelper.productCount(),
            dashboardHelper.totalRevenue(),
            dashboardHelper.monthlyRevenue(),
            dashboardHelper.activeUsers(),
            dashboardHelper.categoryRevenue(req.session.dashboardStart,req.session.dashboardEnd),
            dashboardHelper.salesData()
        ]);
        let timePeriod = req.session.dashTimePeriod
        const start = req.session.dashboardStart
        const end = req.session.dashboardEnd
        if(!timePeriod)timePeriod = null
        return res.render("admin/dashboard",{completedOrders,ordersToShip,todayIncome,productCount,totalRevenue,monthlyRevenue,activeUsers,categoryRevenue,salesData,timePeriod,start,end})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const topProduct = async(req,res,next)=>{
    try {
        const products = await product.find({}).sort({salesCount:-1}).limit(10)
        res.render("admin/topProducts",{products})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const topCategory = async(rreq,res,next)=>{
    try {
        const categoryRevenueData = await product.aggregate([
            {
                $match:{salesCount:{$gt:0}}
            },
            {
                $group:{
                    _id: "$productCategoryId",
                    totalProducts:{ $sum: "$salesCount" }
                }
            },
            {
                $lookup:{
                    from:"category",
                    localField:"_id",
                    foreignField:"_id",
                    as:"categoryRevenueData"
                }
            },
            {
                $project: {
                    categoryName: { $arrayElemAt: ["$categoryRevenueData.categoryName", 0] },
                    totalProducts: 1
                }
            }
        ])
        for(let i of categoryRevenueData){
            const categories = await category.findOne({_id:i._id})
            i.categoryName = categories.categoryName
        }
        let result = []
        for(let i of categoryRevenueData){
            const tem = {name: i.categoryName, value: i.totalProducts}
            result.push(tem)
        }
        categoryRevenueData.sort((a, b) => b.totalProducts - a.totalProducts); 
        return res.render("admin/topCategory",{categoryRevenueData})
    } catch (error) {
        console.log("categoryRevenue Error:",error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const adminLogPost = async(req,res,next)=>{
    if(req.body.email===process.env.EMAIL && req.body.password === process.env.PASSWORD){
        req.session.adminVer = true
        return res.redirect("/admin/home")
    } else {
        req.session.adminError = "Incorrect Email or Password"
        return res.redirect("/admin")
    }
}

const adminUser = async(req,res,next)=>{
    try {
        const users = await usercollection.find({}).sort({ createdAt: -1 });
        return res.render("admin/users",{users})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const unListUser = async(req,res,next)=>{
    try {
        const userId = req.params.id;
        await usercollection.updateOne({ _id:userId}, { isActive:false});
        res.json({ success: true, message: 'User Blocked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to block User.' });
    }
}

const listUser = async(req,res,next)=>{
    try {
        const userId = req.params.id;
        await usercollection.updateOne({ _id:userId}, { isActive:true});
        res.json({ success: true, message: 'User Unblocked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to block User.' });
    }
}

const logoutAdmin = async(req,res,next)=>{
    try {
        req.session.adminVer = false
        res.redirect("/admin")
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const dashBoardDateWiseFilter = async(req,res,next)=>{
    try {
        req.session.dashboardStart = req.body.startDate
        req.session.dashboardEnd = req.body.endDate
        req.session.dashTimePeriod = null
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const timePeriodFilter = async(req,res,next)=>{
    try {
        const today = new Date();
        req.session.dashboardEnd = today
        if(req.body.timePeriod == "week"){
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
            req.session.dashboardStart = lastWeek
        }
        else if(req.body.timePeriod == "month"){
            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
            req.session.dashboardStart = lastMonth
        }
        else if(req.body.timePeriod == "year"){
            const lastYear = new Date();
            lastYear.setFullYear(today.getFullYear() - 1);
            req.session.dashboardStart = lastYear
        }
        req.session.dashTimePeriod = req.body.timePeriod
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const clearDashFilter = async(req,res,next)=>{
    try {
        req.session.dashboardStart = null
        req.session.dashboardEnd = null
        req.session.dashTimePeriod = null
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

module.exports = {adminLog,topProduct,topCategory,adminHome,adminUser,adminLogPost,unListUser,listUser,logoutAdmin,dashBoardDateWiseFilter,timePeriodFilter,clearDashFilter}