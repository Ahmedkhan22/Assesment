//add dingle capab
const express = require('express');
const router = express.Router();
const capabilities = require('../models/Capability')
const strands = require('../models/Strands')
const data = require('./data.json').Sheet1

router.post('/addcapability', (req, res) => {
    let data = {
        name: req.body.name,
        remarks:req.body.remarks,
        strand:req.body.strandid
    }
    capabilities.create(data, (err, doc) => {
        if (err) console.log(err);
        else {
            strands.findByIdAndUpdate(req.body.strandid, { $push: { capabilities: doc._id } }).exec((er, dc) => {
                if (er) console.log(er);
                else res.send(doc)
            })

        };
    })
})

router.post('/disablecapability', async (req, res) => {
    capabilities.findByIdAndUpdate(req.body.id, { enabled: req.body.enabled }, { new: true }).exec((err, doc) => {
        if (err) console.log(err);
        else {
            res.send(doc);
        };
    });
});


router.get('/showenable', (req, res) => {
    capabilities.find({ enabled: true })
    .populate('strand',"name")
    .exec((err, doc) => {
        if (err) console.log(err);
        else res.send(doc)
    })
})

router.post('/capabilityshow', (req, res) => {
    capabilities.find().exec((err, doc) => {
        if (err) console.log(err);
        else {
            res.send(doc)
        }
    })
})

router.post('/bulkCapabilitiess',(req,res)=>{
    data.forEach((elem)=>{
        if(elem.hasOwnProperty('Capability')){
            let cap={
                name:elem.Capability,
                remarks:[
                    {
                        level:1,
                        text:elem.L1!==undefined?elem.L1:"No remarks"
                    },
                    {
                        level:2,
                        text:elem.L2!==undefined?elem.L2:"No remarks"
                    },
                    {
                        level:3,
                        text:elem.L3!==undefined?elem.L3:"No remarks"
                    },
                    {
                        level:4,
                        text:elem.L4!==undefined?elem.L4:"No remarks"
                    },
                    {
                        level:5,
                        text:elem.L5!==undefined?elem.L5:"No remarks"
                    }
                ]
            }
            capabilities.create(cap,(err,doc)=>{
                if(err)return res.json({message:"Failed",err})
                else{
                    strands.findOneAndUpdate({name:elem.Strand},{$push:{capabilities:doc._id}},{new:true})
                    .exec((errr,str)=>{
                        if(errr)return res.json({message:"Failed",errr})
                        else{
                            capabilities.findByIdAndUpdate(doc._id,{strand:str._id},{new:true}).exec((er,dat)=>{
                                if(er)return res.json({message:"Failed",er})
                                else{
                                    console.log('sidhfs')
                                }
                            })
                        }
                    })
                }
            })
        }
    })
    setTimeout(()=>{
        return res.json({message:"Success"})
    },20000)
})

router.put('/updatecapability',(req,res)=>{
        
    capabilityid=req.body.capabilityid
        capabilities.findByIdAndUpdate(capabilityid,{name:req.body.name,strand:req.body.strandid,remarks:req.body.remarks},{new:true})
            .populate('strand',"name")
            .exec((err,doc)=>{
            if(err){
                return res.json({message:"Failed",err})
            }
            else{
                // let data=req.body
                // let i=[]
                // data.remarks.forEach(ele=>{
                // console.log(ele._id)
                // remarksid=ele._id
                // console.log(capabilityid)
                
                //     capabilities.findOneAndUpdate({capabilityid,remarksid},{"remarks.$.level":ele.level,"remarks.$.text":ele.text},{new:true},(err,doc)=>{
                //    if(err)
                //    {
                //        return res.json({message:"Failed",err})
                //    }
                //    else{
    
                //        i.push(doc)
                       
                //    }
                //     })
                // }),setTimeout(() => {
                //     return res.json({message:"Successfully Updated",i})  
                //    }, 2000);
                return res.json({message:"Successfully Updated",doc})
                }
        })
        
})

router.put('/deletecapability',(req,res)=>{
    _id=req.body.capabilityid
    capabilities.findByIdAndUpdate(_id,{enabled:false},{new:true},(err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Successfully Deleted Capability",doc})
        }
    })
})

router.post('/getsinglecapability',(req,res)=>{
    _id=req.body.capabilityid
    capabilities.findById(_id)
    .populate('strand',"name")
    .exec((err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Successfull",doc})
        }
    })
})
module.exports = router