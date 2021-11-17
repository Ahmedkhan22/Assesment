const mongoose=require('mongoose')
const answerSchema=new mongoose.Schema({
    assessmentid:{type:mongoose.Schema.Types.ObjectId,ref:'assessments'},
    question:String,
    answer:Number
})
module.exports=mongoose.model('answers',answerSchema)