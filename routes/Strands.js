//add single strand code
const express = require('express');
const router = express.Router();
const dimensions = require('../models/Dimensions')
const Strand = require('../models/Strands')
const Questions=require('../models/Questions')
const Capabilities=require('../models/Capability')
const data = require('./data.json').Sheet1;
const Strands = require('../models/Strands');
const Dimensions = require('../models/Dimensions');
router.post('/addstrand', (req, res) => {
    let data = {
        name: req.body.name,
        weightage: req.body.weightage,
        dimension: req.body.dimension,
    }
    
    Strand.create(data, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            _id=req.body.dimension
            dimensions.findByIdAndUpdate(_id, { $push: { strands: doc._id } }).exec((er, dc) => {
                if (er) console.log(er);
                else {
                    let questiondata={
                        dimensionid: req.body.dimension,
                        text:req.body.text,
                        strand:doc._id
                    }
                    // res.json({ message: "Successdully Created:", doc })
                    Questions.create(questiondata,(err,ques)=>{
                        if(err){return res.json({message:"Failed",err})}
                        else{
                            _id=doc._id
                            Strands.findByIdAndUpdate(_id,{question:ques._id},{new:true},(err,updatequestioninstrand)=>{
                                if(err)
                                {
                                    return res.json({message:"Failed",err})
                                }
                                else
                                {
                                    res.json({ message: "Successdully Created:", updatequestioninstrand,ques})
                                }
                                
                            })
                        }
                    })
                }
            })

        };
    })
})

router.post('/disablestrand', async (req, res) => {
    Strand.findByIdAndUpdate(req.body.id, { enabled: req.body.status }, { new: true }).exec((err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfull:", doc })
        }
    });
});


router.get('/showenablestrands',(req, res) => {
    Strand.find({ enabled: true })
    .populate('dimension',"name")
    .populate('question',"text")
    .exec((err,doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfull:", doc })
        }
        })
    })

router.get('/showdisablestrands', (req, res) => {
    Strand.find({ enabled: false }, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfull:", doc })
        }
    })
})

router.get('/strandshow', (req, res) => {
    Strand.find({}, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfull:", doc })
        }
    })
})

router.post('/bulkStrands', (req, res) => {
    data.forEach((elem) => {
        if (elem.hasOwnProperty('Strand')) {

            let strand = {
                name: elem.Strand,
                weightage: Math.random() * (2 - 1) + 1
            }
            Strand.create(strand, (err, doc) => {
                if (err) return res.json({ message: "Failed", err })
                else dimensions.findOneAndUpdate({ name: elem.Dimension }, { $push: { strands: doc._id } }, { new: true })
                    .exec((er, dim) => {
                        if (er) return res.json({ message: "Failed", er })
                        else {
                            Strand.findByIdAndUpdate(doc._id,{dimension:dim._id},{new:true}).exec((errr,ress)=>{
                                if(errr)return res.json({message:"Failed"},errr)
                                else{
                                    console.log('stra->',ress)
                                }
                            })
                        }
                    })

            })

        }
    })
    setTimeout(() => {
        return res.json({ message: "Success" })
    }, 8000)
})

// router.put('/disablestrandbystrandid',(req,res)=>{
//     _id=req.body.strandid
//     Strands.findByIdAndUpdate(_id,{enabled:false},{new:true},(err,doc)=>{
//         if(err){
//             return res.json({meesage:"Failed",err})
//         }
//         else{
//             return res.json({meesage:"Successfully Deleted Strand",doc})
//         }
//     })
// })

router.put('/editstrand',(req,res)=>{
    _id=req.body.strandid
    Strands.findByIdAndUpdate(_id,{name:req.body.name,weightage:req.body.weightage,dimension:req.body.dimension},{new:true})
    .populate('dimension',"name")
    .populate('question',"text")
    .exec((err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            _id=doc.question
            Questions.findByIdAndUpdate(_id,{text:req.body.text},{new:true},(err,docc)=>{
                if(err){
                    return res.json({message:"Failed",err})
                }
                else{
                    return res.json({message:"Successfully Updated Strand",doc})
                }
            })
        }
    })
})

router.post('/getsinglestrand',(req,res)=>{
    _id=req.body.strandid
    Strands.findById(_id)
    .populate('dimension',"name")
    .populate('question',"text")
    .exec((err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Successfull",doc})
        }
    })
})

router.delete('/deletestrandbystrandid',(req,res)=>{
    _id=req.body.strandid
    Strands.findByIdAndUpdate(_id,{enabled:false},{new:true},(err,docccc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            Questions.findOneAndUpdate({strand:req.body.strandid},{enabled:false},{new:true},(err,doccc)=>{
                if(err){
                    return res.json({message:"Failed",err})
                }
                else{
                    Capabilities.findOneAndUpdate({strand:req.body.strandid},{enabled:false},{new:true},(err,docc)=>{
                        if(err){
                            return res.json({message:"Failed",err})
                        }
                        else{
                            Dimensions.findOneAndUpdate({_id:docccc.dimension},{$pull:{strands:{$in:req.body.strandid}}},(err,doc)=>{
                                if(err){
                                    return res.json({message:"Failed",err})
                                }
                                else{
                                    return res.json({message:"Succcess",doc})
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})
module.exports = router