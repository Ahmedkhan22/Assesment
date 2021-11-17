const mongoose=require('mongoose')
const answerrSchema=new mongoose.Schema({
    assessmentid:String,
    dimensionid:{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"},
    percent:Number,
    question:{type:mongoose.Schema.Types.ObjectId,ref:"questions"},
    answer:Number
})

const singleanswerSchema=new mongoose.Schema({
    assessmentid:{type:mongoose.Schema.Types.ObjectId,ref:'assessments'},
    dimensionid:{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"},
    question:{type:mongoose.Schema.Types.ObjectId,ref:"questions"},
    answer:Number
})
const graphSchema=new mongoose.Schema({
    dimensionid:{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"},
    dimensionname:String,
    image:String
})
const AssessmentSchema=new mongoose.Schema
({
    userid:{type:mongoose.Schema.Types.ObjectId,ref:"assessmentusers"},
    companyname:String,
    industry:String,
    assessment:[answerrSchema],
    answers:[singleanswerSchema],
    selecteddimensions:[{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"}],
    revenue:Number,
    region:String,
    graph:[graphSchema],
    pdffile:String
})

module.exports=mongoose.model('assessments',AssessmentSchema)