const mongoose=require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type: String,
        required:true,
    },
    percentage:{
        type: String,
        required:true,
    },
    startDate:{
        type: Date,
        required:true,
    },
    expiryDate:{
        type: Date,
        required:true,
    },
    minPurchase:{
        type: Number,
    },
    maxDiscount:{
        type: Number,
    },
    usedCount:{
        type: Number,
        default: 0,
    },
    totalDiscount:{
        type: Number,
        default: 0,
    },
    usedBy:{
        type: Array,
    },
},
{
    timestamps:true
})


const coupon = mongoose.model('coupon',couponSchema)
module.exports = coupon