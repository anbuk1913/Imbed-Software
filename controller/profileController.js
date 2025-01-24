const usercollection = require("../model/userModel");
const address = require("../model/address");

const profile = async(req,res)=>{
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail });
    if(!userVer.isActive){
        return res.redirect("/blocked")
    } else {
        return res.render("user/profile",{userVer})
    }
}

const addressPage = async(req,res)=>{
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail });
    const userAddress = await address.find({userId:userVer._id})
    res.render("user/address",{userVer,userAddress})
}

const addAddress = async(req,res)=>{
    const userEmail = req.session.user.email
    const userVer = await usercollection.findOne({ email: userEmail });
    res.render("user/addAddress",{userVer})
} 

const addAddressPost = async(req,res)=>{
    try {
        const addressCount = await address.countDocuments({userId:req.body.userId});
        const newaddress = new address({
            userId: req.body.userId ,
            addressCount: addressCount+1,
            doorNo: req.body.doorNo,
            city: req.body.city,
            street: req.body.street,
            district: req.body.district,
            pinCode: req.body.pinCode,
        });
        newaddress.save();
        return res.status(200).send({ success: true,message: "Address Added Successfully!"})
    } catch (error) {
        console.log("add",error)
    }
}



module.exports = {profile,addressPage,addAddress,addAddressPost}