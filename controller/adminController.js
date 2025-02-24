const usercollection = require("../model/userModel")

const adminLog = async(req,res)=>{
    if(req.session.adminVer){
        return res.redirect("/adminusers")
    } else {
        const adminError = req.session.adminError
        return res.render("admin/login",{adminError})
    }
}

const adminHome = async (req,res)=>{
        return res.render("admin/adminDash")
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
    const users = await usercollection.find({}).sort({ createdAt: -1 });
    return res.render("admin/users",{users})
}

const unListUser = async(req,res)=>{
    try {
        const userId = req.params.id;
        await usercollection.updateOne({ _id:userId}, { isActive:false});
        res.json({ success: true, message: 'User Blocked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to block User.' });
    }
}

const listUser = async(req,res)=>{
    try {
        const userId = req.params.id;
        await usercollection.updateOne({ _id:userId}, { isActive:true});
        res.json({ success: true, message: 'User Unblocked successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to block User.' });
    }
}

const logoutAdmin = async(req,res)=>{
    try {
        req.session.adminVer = false
        res.redirect("/admin")
    } catch (error) {
        console.log(error)
    }
}

module.exports = {adminLog,adminHome,adminUser,adminLogPost,unListUser,listUser,logoutAdmin}