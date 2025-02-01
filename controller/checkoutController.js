const cart = require("../model/cartModel")
const usercollection = require("../model/userModel")
const address = require("../model/address");
const order = require("../model/orders");
const product = require("../model/productModel");

const checkoutPageOne = async(req,res)=>{
    try {
        if(req.session.checkOne){
            const userEmail = req.session.user.email
            const userVer = await usercollection.findOne({ email: userEmail });
            const addressCollection = await address.find({userId: userVer._id})
            const name = userVer.name
            return res.render("user/checkout_1",{userVer,name,addressCollection})
        }
    } catch (error) {
        console.log(error)
    }
}

const checkoutTwoPost = async(req,res)=>{
    try {
        req.session.firstName = req.body.firstName
        req.session.lastName = req.body.lastName
        req.session.phone = req.body.phone
        req.session.email = req.session.user.email
        req.session.orderNotes = req.body.orderNotes
        if(req.body.address != "new"){
            req.session.addressId = req.body.address
        } else {
            req.session.doorNums = req.body.doorNum
            req.session.street = req.body.street
            req.session.city = req.body.city
            req.session.district = req.body.district
            req.session.postcode = req.body.postcode
        }
        return res.redirect("/billing")
    } catch (error) {
        console.log(error)
    }
}

const billingPage = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        return res.render("user/checkout_2",{userVer,name})
    } catch (error) {
        console.log(error)
    }
}

const billingMethodPost = async(req,res)=>{
    try {
        req.session.billingMethode = req.body.shipping
        return res.redirect("/payment")
    } catch (error) {
        console.log(error)
    }
}

const paymentPage = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        const name = userVer.name
        return res.render("user/checkout_3",{userVer,name})
    } catch (error) {
        console.log(error)
    }
}

const paymentMethod = async(req,res)=>{
    try {
        req.session.paymentMethod = req.body.payment
        return res.redirect("/review")
    } catch (error) {
        console.log(error)
    }
}

const finalReview = async(req,res)=>{
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
        const deliveryFee = {datas:req.session.billingMethode}

        res.render("user/checkout_4",{name,cartItems,deliveryFee})
    } catch (error) {
        console.log(error)
    }
}

const finalQuantityCheck = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        let cartItems = await cart.find({userId:userVer._id}).populate({
            path: "productId",
            select: "productName productPrice productOfferPrice productImage1 isListed productStock _id"
        });
        for(let i=0;i<cartItems.length;i++){
            if(cartItems[i]?.productQuantity>cartItems[i]?.productId?.productStock){
                return res.json({success: false, message: `${cartItems[i].productId?.productName} Only ${cartItems[i].productId?.productStock} left in stock!`});
            }
        }
        return res.json({success: true});
    } catch (error) {
       console.log(error) 
    }
}

const orderPost = async(req,res)=>{
    try {
        const userEmail = req.session.user.email
        const userVer = await usercollection.findOne({ email: userEmail });
        let placedAddress = {}
        const priceDetail = {
            subTotal:req.body.subTotal,
            delivery:req.body.delivery,
            gst:req.body.gst,
            total:req.body.total
        }
        if(req.session.addressId){
            const orderAddress = await address.findOne({_id:req.session.addressId})
            placedAddress = {
                doorNo:orderAddress.doorNo,
                street:orderAddress.street,
                city:orderAddress.city,
                district:orderAddress.district,
                pinCode:orderAddress.pinCode,
            }
        } else {
            placedAddress = {
                doorNo:req.session.doorNums,
                street:req.session.street,
                city:req.session.city,
                district:req.session.district,
                pinCode:req.session.postcode,
            }
            const addressCount = await address.countDocuments({userId:userVer._id});
            const newaddress = new address({
                userId: userVer._id ,
                addressCount: addressCount+1,
                doorNo: req.session.doorNums,
                street: req.session.street,
                city: req.session.city,
                district: req.session.district,
                pinCode: req.session.postcode,
            });
            newaddress.save();
        }
        
        let cartItems = await cart.find({userId:userVer._id}).populate({
            path: "productId",
            select: "productName productPrice productOfferPrice productImage1 isListed productStock _id"
        });

        let productDetails=[]
        for(let i=0;i<cartItems.length;i++){
            let price=0
            if(cartItems[i].productId?.productOfferPrice)price=cartItems[i].productId.productOfferPrice
            else price = cartItems[i].productId.productPrice
            let obj={
                productName:cartItems[i].productId.productName,
                productPrice:price,
                quantity:cartItems[i].productQuantity
            }
            productDetails.push(obj)
        }

        const orders = new order({
            userId:userVer._id,
            address:placedAddress,
            fullName:req.session.firstName+req.session.lastName,
            phone:req.session.phone,
            email:req.session.email,
            paymentMethod:req.session.paymentMethod,
            orderNotes:req.session.orderNotes,
            priceDetails:priceDetail,
            products:productDetails
        }) 
        for(let i=0;i<cartItems.length;i++){
            const count=-(cartItems[i].productQuantity)
            const id = cartItems[i].productId
            await product.updateOne({_id:id},{$inc:{productStock:count}})
        }
        await cart.deleteMany({userId:userVer._id})
        let newID = await orders.save();
        req.session.orderId = newID._id
        return res.status(200).send({ success: true})
    } catch (error) {
        console.log(error)
    }
}

const confirmPage = async(req,res)=>{
    try {
        if(req.session.orderId){
            const userEmail = req.session.user.email
            const userVer = await usercollection.findOne({ email: userEmail });
            const name = userVer.name;
            const orderId = req.session.orderId
            return res.render('user/confirmOrder',{userVer,name,orderId})
        } else {
            return res.redirect('/shop')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {checkoutPageOne,checkoutTwoPost,billingPage,billingMethodPost,paymentPage,paymentMethod,finalReview,finalQuantityCheck,orderPost,confirmPage}