const product = require("../model/productModel")
const category = require("../model/categoryModel");
const usercollection = require("../model/userModel");

const shopPage = async (req,res)=>{
    let name = ""
    const products = await product.find({});
    const categories = await category.find({});
    if(req.session.loginSession || req.session.signupSession){
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        if(userVer){
            if(userVer.isActive == false){
                req.session.block = true
                return res.redirect("/blocked")
            } else {
                name = userVer.name
                return res.render("user/shop",{name,products,categories})
            }
        } else {
            return res.render("user/shop",{name,products,categories})
        }
    } else {
        return res.render("user/shop",{name,products,categories})
    }
}

module.exports = {shopPage}