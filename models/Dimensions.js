const mongoose = require('mongoose')
const dimensionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    strands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'strands' }]
})
module.exports = mongoose.model('dimensions', dimensionSchema)