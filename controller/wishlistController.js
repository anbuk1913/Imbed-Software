const cart = require("../model/cartModel")
const wishlist = require("../model/wishlistModel")
const usercollection = require("../model/userModel")

const wishlistPage = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        let products = await wishlist.find({userId:userVer._id}).populate({
            path: "productId",
            select: "productName productPrice productOfferPrice productImage1 isListed productStock _id"
       });
       res.render("user/wishlist",{name,products,userVer})
    } catch (error) {
        console.log(error)
    }
}

const editWishlist = async(req,res)=>{
    try{
        if(req.body.wishlist){
            newData = new wishlist({
                userId : req.body.userId,
                productId : req.body.productId
            })
            await newData.save();
            return res.status(200).send({ success: true})
        } else {
            await wishlist.deleteOne({userId:req.body.userId, productId:req.body.productId})
            return res.status(200).send({ success: true})
        }
    } catch(error){
        console.log(error)
    }
}

const deleteProduct = async(req,res)=>{
    try {
        const data = await wishlist.deleteOne({userId:req.body.userId, productId:req.body.productId})
        if(data.deletedCount!=0){
            return res.json({success: true, message: 'Product removed'});
        } else {
            return res.json({success: false, message: 'Somthing Wrong!'});
        }
    } catch (error) {
        console.log(error)
    }
}

const addAlltoCart = async(req,res)=>{
    try {
        const wishlistData = await wishlist.find({userId:req.body.userId})
        for(let i of wishlistData){
            await cart.updateOne({ userId: i.userId, productId:i.productId }, { $set: { userId: i.userId, productId:i.productId } },{upsert:true});
        }
        return res.json({success: true, message: 'Products added to cart!'});
    } catch (error) {
        console.log(error)
    }
}

module.exports = {wishlistPage,editWishlist,deleteProduct,addAlltoCart}