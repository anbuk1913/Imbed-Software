

const homePage = async (req,res)=>{
    res.render("user/home")
}

const loginPage = async(req,res)=>{
    const logErr = req.session.logErr
    res.render("user/login",{logErr})
}

const signUpPage = async(req,res)=>{
    const signErr = req.session.signErr
    res.render("user/signup",{signErr})
}

const otpPage = async(req,res)=>{
    res.render("user/otp")
}

module.exports = {homePage,loginPage,signUpPage,otpPage}