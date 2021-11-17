const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    text: String,
    enabled: { type: Boolean, default: true },
    strand:{type:mongoose.Schema.Types.ObjectId,ref:"strands"},
    dimensionid:{type:mongoose.Schema.Types.ObjectId,ref:"dimensions"}
})
module.exports = mongoose.model('questions', questionSchema)