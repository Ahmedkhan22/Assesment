const mongoose=require('mongoose')
const remarks=new mongoose.Schema({
    strand:{type:mongoose.Schema.Types.ObjectId,ref:"strands"},
    remarks_with_capabilities:[{name:String,current_remarks:String,next_remarks:String}]
})

const RemarksSchema=new mongoose.Schema({
    assessmentid:{type:mongoose.Schema.Types.ObjectId,ref:"assessments"},
    dimensionid:{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"},
    remarks:[remarks]
       
})
module.exports=mongoose.model('remarksschema',RemarksSchema)