const usercollection = require("../model/userModel");
const address = require("../model/address");
const bcrypt = require('bcrypt')

async function encryptPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function comparePassword(enteredPassword, storedPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, storedPassword);
    return isMatch;
}

const profile = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        if(!userVer.isActive){
            return res.redirect("/blocked")
        } else {
            return res.render("user/profile",{userVer})
        }
    } catch (error) {
        console.log(error)
    }
} 

const editProfile = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        await cart.updateOne({_id:userVer._id},{$set:{name:req.body.userId,productId:req.body.productId,productQuantity:req.body.productQuantity}})
    } catch (error) {
        console.log(error)
    }
}

const addressPage = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const userAddress = await address.find({userId:userVer._id})
        res.render("user/address",{userVer,userAddress})
    } catch (error) {
        console.log(error)
    }
}

const addAddress = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        res.render("user/addAddress",{userVer})   
    } catch (error) {
        console.log(error)
    }
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
        console.log(error)
    }
}

const editAddress = async(req,res)=>{
    try {
        const addressId = req.params.id;
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const addressData = await address.findById({_id:addressId})
        return res.render('user/editAddress',{addressData,userVer})
    } catch (error) {
        console.log(error)
    }
}

const editAddressPut = async(req,res)=>{
    try {
        console.log(req.body)
        await address.updateOne({_id:req.body._id},{$set:{doorNo: req.body.doorNo, street: req.body.street, city: req.body.city, district: req.body.district, pinCode: req.body.pinCode}})
        return res.json({ success: true, message: 'Address Edited Successfully!'});
    } catch (error) {
        console.log(error)
    }
}

const deleteAddress = async(req,res)=>{
    try {
        const addressId = req.params.id;
        const addressNum = await address.findOne({_id:addressId})
        const results = await address.updateMany({userId:addressNum.userId,addressCount:{$gt:addressNum.addressCount}},{$inc:{addressCount:-1}})
        console.log(addressNum)
        console.log(results)
        const data = await address.findByIdAndDelete({_id:addressId})
        if(data){
            return res.json({success:true, message:"Address deleted Successfully!"})
        } else {
            return res.json({success:false, message:"Somthing Wrong!"})
        }
    } catch (error) {
        console.log(error)
    }
}

const changePassword = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        if(userVer.password){
            return res.render("user/changePassword",{userVer})
        }
        else {
            return res.redirect("/profile")
        }
    } catch (error) {
        console.log(error)
    }
}

const changePasswordPatch = async(req,res)=>{
    try {
        const user = await usercollection.findOne({ email: req.session.user.email })
        if (await comparePassword(req.body.oldPassword,user.password)){
            const newHashedPass = await encryptPassword(req.body.newPassword)
            await usercollection.updateOne({email:req.session.user.email},{$set:{password:newHashedPass}})
            return res.json({success:true, message:"Password Changed!"})
        } else {
            return res.json({success:false, message:"Incorrect Old password!"})
        }
    } catch (error) {
        console.log(error)
    }
}

const editUserData = async(req,res)=>{
    try {
        await usercollection.updateOne({email:req.session.user.email},{$set:{name:req.body.name,phone:req.body.phone}})
        return res.json({success:true, message:"Pofile Updated!"})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {profile,editProfile,addressPage,addAddress,addAddressPost,editAddress,editAddressPut,deleteAddress,changePassword,changePasswordPatch,editUserData}