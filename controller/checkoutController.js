const usercollection = require("../model/userModel")
const address = require("../model/address");

const checkoutPageOne = async(req,res)=>{
    try {
        if(req.session.checkOne){
            const userEmail = req.session.user.email
            const userVer = await usercollection.findOne({ email: userEmail });
            const addressCollection = await address.find({userId: userVer._id})
            const name = userVer.name
            return res.render("user/checkout_1",{userVer,name,addressCollection})
        }
    } catch (error) {
        console.log(error)
    }
}

const checkoutTwoPost = async(req,res)=>{
    try {
        req.session.firstName = req.body.firstName
        req.session.lastName = req.body.lastName
        req.session.phone = req.body.phone
        req.session.email = req.body.email
        if(req.body == "new"){
            req.session.addressId = req.body.address
        } else {
            req.session.doorNums = req.body.doorNums
            req.session.street = req.body.street
            req.session.city = req.body.city
            req.session.district = req.body.district
            req.session.postcode = req.body.postcode
        }
        return res.redirect("/billing")
    } catch (error) {
        console.log(error)
    }
}

const billingPage = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        return res.render("user/checkout_2",{userVer,name})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {checkoutPageOne,checkoutTwoPost,billingPage}