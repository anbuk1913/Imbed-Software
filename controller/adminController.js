const usercollection = require("../model/userModel")
const AppError = require("../middleware/errorHandling")

const adminLog = async(req,res,next)=>{
    if(req.session.adminVer){
        return res.redirect("/adminusers")
    } else {
        const adminError = req.session.adminError
        return res.render("admin/login",{adminError})
    }
}

const adminHome = async (req,res,next)=>{
        return res.render("admin/adminDash")
}

const adminLogPost = async(req,res,next)=>{
    if(req.body.email===process.env.EMAIL && req.body.password === process.env.PASSWORD){
        req.session.adminVer = true
        return res.redirect("/adminusers")
    } else {
        req.session.adminError = "Incorrect Email or Password"
        return res.redirect("/admin")
    }
}

const adminUser = async(req,res,next)=>{
    const users = await usercollection.find({}).sort({ createdAt: -1 });
    return res.render("admin/users",{users})
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
        next(new AppError('Sorry...Something went wrong', 500));
        console.log(error)
    }
}

module.exports = {adminLog,adminHome,adminUser,adminLogPost,unListUser,listUser,logoutAdmin}