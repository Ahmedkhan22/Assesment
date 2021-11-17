  
const mongoose=require('mongoose')
const UserOtpSchema=new mongoose.Schema({
    phnumber:{
        type:String,
        required:true
    },
    otpcode:Number
})

module.exports=mongoose.model('assessmentuserotps',UserOtpSchema)