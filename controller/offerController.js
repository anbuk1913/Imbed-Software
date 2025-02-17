const category = require("../model/categoryModel");

const offerPage = async(req,res)=>{
    try {
        const categoryOffer = []
        const categories = []
        return res.render("admin/categoryOffer",{categoryOffer,categories})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {offerPage}