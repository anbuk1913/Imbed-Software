const order = require("../model/orders");
const wallet = require("../model/walletModel");
const usercollection = require("../model/userModel")
const pdfService = require("../services/invoice")
const AppError = require("../middleware/errorHandling")

const userOrder = async(req,res,next)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        const orders = await order.find({userId:userVer._id}).sort({ createdAt: -1 })
        return res.render("user/orders",{userVer,name,orders})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const userOrderView = async(req,res,next)=>{
    try {
        const orderId = req.params.id;
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        const orderData = await order.findById({_id:orderId})
        return res.render('user/singleOrder',{orderData,userVer,name})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const adminOrderview = async(req,res,next)=>{
    try {
        const orders = await order.find({}).sort({ createdAt: -1 })
        res.render('admin/orders',{orders})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const adminSingleOrderView = async(req,res,next)=>{
    try {
        const orderId = req.params.id;
        const orderData = await order.findById({_id:orderId})
        if(orderData){
            return res.render('admin/singleOrder',{orderData})
        } else {
            return res.redirect('/orders')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const adminEditOrder = async(req,res,next)=>{
    try {
        const orderId = req.params.id;
        const orderData = await order.findById({_id:orderId})
        if(orderData){
            return res.render('admin/editOrder',{orderData})
        } else {
            return res.redirect('admin/orders')
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const adminEditOrderPost = async(req,res,next)=>{
    try {
        if(req.body.orderStatus == "Delivered"){
            await order.updateOne({_id:req.body.orderId},{$set:{status:req.body.orderStatus, deliveryDate: new Date()}})
        } else {
            await order.updateOne({_id:req.body.orderId},{$set:{status:req.body.orderStatus}})
        }
        return res.redirect("/admin/orders")
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const editOrder = async(req,res,next)=>{
    try {
        const datas = await order.findById({_id:req.body.orderId})
        if(req.body.orderStatus == 'Returned' && datas.paymentMethod == "COD"){
            const transactionData = {
                transactionDate: new Date(),
                transactionAmount: datas.priceDetails.total,
                transactionType: "Credit on Cancel"
            };
            const changes = datas.priceDetails.total
            await wallet.updateOne(
                {userId:datas.userId},
                {
                    $inc: { walletBalance: changes },
                    $push: { walletTransaction: transactionData }
                },
                { new: true }
            );
            await order.updateOne({_id:req.body.orderId},{$set:{status:req.body.orderStatus}})
            res.json({ success: true, message: 'Order Status Updated!' });
        } else {
            await order.updateOne({_id:req.body.orderId},{$set:{status:req.body.orderStatus}})
            res.json({ success: true, message: 'Order Status Updated!' });
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const cancelOrder = async(req,res,next)=>{
    try {
        const id = req.query.orderId
        const data = await order.updateOne({_id:id},{$set:{status:"Cancelled"}})
        if(data){
            return res.json({success:true})
        } else {
            return res.json({success:false})
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const returnOrder = async(req,res,next)=>{
    try {
        const id = req.query.orderId
        const data = await order.updateOne({_id:id},{$set:{status:"Return processing",returnReason: req.body.value}})
        if(data){
            return res.json({success:true})
        } else {
            return res.json({success:false})
        }
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const generateInvoice = async(req,res,next)=>{
    try {
        const orderId = req.params.id;
        const orderData = await order.findById({_id:orderId})
        const pdfPath = await pdfService.generateInvoice(orderData)
        res.download(pdfPath);
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

const rePay = async(req,res,next)=>{
    try {
        await order.updateOne({_id:req.body.id},{$set:{status:"Pending"}})
        req.session.orderId = req.body.id
        return res.json({success:true})
    } catch (error) {
        console.log(error)
        next(new AppError('Sorry...Something went wrong', 500))
    }
}

module.exports = {userOrder,userOrderView,adminSingleOrderView,adminOrderview,adminEditOrder,editOrder,adminEditOrderPost,cancelOrder,returnOrder,generateInvoice,rePay}