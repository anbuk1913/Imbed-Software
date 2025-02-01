const order = require("../model/orders");
const usercollection = require("../model/userModel")

const userOrder = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        const orders = await order.find({userId:userVer._id})
        return res.render("user/orders",{userVer,name,orders})
    } catch (error) {
        console.log(error)
    }
}

const userOrderView = async(req,res)=>{
    try {
        const orderId = req.params.id;
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        const orderData = await order.findById({_id:orderId})
        return res.render('user/singleOrder',{orderData,userVer,name})
    } catch (error) {
        console.log(error)
    }
}

const adminOrderview = async(req,res)=>{
    try {
        const orders = await order.find({})
        res.render('admin/orders',{orders})
    } catch (error) {
        console.log(error)
    }
}

const adminEditOrder = async(req,res)=>{
    try {
        const orderId = req.params.id;
        const orderData = await order.findById({_id:orderId})
        return res.render('admin/editOrder',{orderData})
    } catch (error) {
        console.log(error)
    }
}

const adminEditOrderPost = async(req,res)=>{
    try {
        await order.updateOne({_id:req.body.orderId},{$set:{status:req.body.orderStatus}})
        return res.redirect("/admin/orders")
    } catch (error) {
        console.log(error)
    }
}

const cancelOrder = async(req,res)=>{
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
    }
}

const returnOrder = async(req,res)=>{
    try {
        const id = req.query.orderId
        const data = await order.updateOne({_id:id},{$set:{status:"Return processing"}})
        if(data){
            return res.json({success:true})
        } else {
            return res.json({success:false})
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {userOrder,userOrderView,adminOrderview,adminEditOrder,adminEditOrderPost,cancelOrder,returnOrder}