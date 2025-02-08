const cart = require("../model/cartModel")
const usercollection = require("../model/userModel")

const cartView = async (req,res) => {
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        let cartItems = await cart.find({userId:userVer._id}).populate({
            path: "productId",
            select: "productName productPrice productOfferPrice productImage1 isListed productStock _id"
       });
       cartItems = cartItems.map((item) => {
            const productStock = item.productId?.productStock || 100; // Default stock if undefined
            item.productQuantity = Math.min(item.productQuantity, productStock); // Adjust quantity to stock
            return item;
        });
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

const removeItem = async(req,res)=>{
    try {
        const id = req.query.id
        const data = await cart.findByIdAndDelete({_id:id})
        if(data){
            return res.json({success: true, message: 'Product removed'});
        } else {
            return res.json({success: false, message: 'Somthing Wrong!'});
        }
    } catch (error) {
        console.log(error)
    }
}

const updateCartItems = async (req, res) => {
    try {
        for (const data of req.body.arr) {
            if(typeof(data.productId)== 'string')continue
            await cart.updateOne({ _id: data.productId }, { $set: { productQuantity: data.value } });
        }
        req.session.checkOne = true
        res.json({success: true});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: 'Somthing Wrong!'});
    }
};

module.exports = {cartView,addtoCart,removeItem,updateCartItems}