const order = require("../model/orders");

const salesReportPage = async(req,res)=>{
    try {
        const orders = await order.find({status:"Delivered"}).sort({ deliveryDate: -1 })
        res.render("admin/salesReport",{orders})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {salesReportPage}