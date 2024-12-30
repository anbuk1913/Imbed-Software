

const adminGet = async (req,res)=>{
    if(req.session.adminVer){
        res.redirect("/adminhome")
    } else {
        const adminError = req.session.adminError
        res.render("admin/login",{adminError})
    }
}

module.exports = {adminGet}