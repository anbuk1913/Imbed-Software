const usercollection = require("../model/userModel")

const adminLog = async(req,res)=>{
    if(req.session.adminVer){
        return res.redirect("/adminHome")
    } else {
        const adminError = req.session.adminError
        return res.render("admin/login",{adminError})
    }
}

const adminHome = async (req,res)=>{
    if(req.session.adminVer){
        return res.render("admin/adminDash")
    } else {
        return res.redirect("/admin")
    }
}

const adminLogPost = async(req,res)=>{
    if(req.body.email===process.env.EMAIL && req.body.password === process.env.PASSWORD){
        req.session.adminVer = true
        return res.redirect("/adminusers")
    } else {
        req.session.adminError = "Incorrect Email or Password"
        return res.redirect("/admin")
    }
}

const adminUser = async(req,res)=>{
    if(req.session.adminVer){
        const users = await usercollection.find({})
        return res.render("admin/users",{users})
    } else {
        res.redirect("/admin")
    }
}

module.exports = {adminLog,adminHome,adminUser,adminLogPost}