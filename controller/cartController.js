const cart = require("../model/cartModel")
const usercollection = require("../model/userModel")

const cartView = async (req,res) => {
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        const cartItems = await cart.find({userId:userVer._id}).populate({
            path: "productId",
            select: "productName productPrice productOfferPrice productImage1 isListed -_id"
       });
       console.log(cartItems)
        res.render("user/cart",{name,cartItems})
    } catch (error) {
        console.log("cartView",error)
    }
}

const addtoCart = async(req,res)=>{
    try{
        await cart.updateOne({userId:req.body.userId,productId:req.body.productId},{$set:{userId:req.body.userId,productId:req.body.productId,productQuantity:req.body.productQuantity}},{upsert:true})
        res.json({success: true, message: 'Product Added to Cart successfully.'});
    } catch(error){
        console.log(error)
    }
    
}

module.exports = {cartView,addtoCart}