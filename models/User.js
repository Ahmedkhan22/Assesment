const mongoose=require('mongoose')
const UsersSchema=new mongoose.Schema
({
    Authorize:{type:Boolean,default:true},
    islogged:{type:Boolean,default:false},
    name:{type:String,required:"name required"},
    email:{type:String,unique:true,required:"email required"},
    password:{type:String,required:"password required"},
    address:String,
    city:String,
    phnumber:Number
})
module.exports=mongoose.model('assessmentusers',UsersSchema)