const mongoose = require('mongoose')
const strandSchema = new mongoose.Schema({
    weightage: { type: Number, required: true,min:0},
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    dimension: { type: mongoose.Schema.Types.ObjectId, ref: "dimensions" },
    question:{type:mongoose.Schema.Types.ObjectId,ref:"questions"},
    capabilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "capabilities" }]
})
module.exports = mongoose.model('strands', strandSchema)