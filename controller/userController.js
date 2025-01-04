

const homePage = async (req,res)=>{
    res.render("user/home")
}

const loginPage = async(req,res)=>{
    try {
        const logErr = "req.session.logErr"
        res.render("user/login",{logErr})
    } catch (error){
        console.log(error)
    }
}

const signUpPage = async(req,res)=>{
    const signErr = req.session.signErr
    res.render("user/signup",{signErr})
}

const otpPage = async(req,res)=>{
    res.render("user/otp")
}

module.exports = {homePage,loginPage,signUpPage,otpPage}