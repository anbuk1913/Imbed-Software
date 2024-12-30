

const homePage = async (req,res)=>{
    res.render("user/home")
}

const loginPage = async(req,res)=>{
    res.render("user/login")
}

module.exports = {homePage,loginPage}