const mongoose=require('mongoose')

const otpSchema=new mongoose.Schema({
    email:{
        required:true,
        type:String,
    },
    otp:{
        required:true,
        type:String
    },
    createdAt:{
        required:true,
        type:Date,
        default:Date.now()
    }

},
{
    timestamps:true
}
)

otpSchema.index({expiresAt:1},{expireAfterSeconds:75})

module.exports=mongoose.model('otp',otpSchema)