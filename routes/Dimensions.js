const express = require('express')
const router = express.Router()
const Dimensions = require('../models/Dimensions')
const data = require('./data.json').Sheet1
router.post('/adddimension', (req, res) => {
    let data = {
        name: req.body.dimensionname
    }
    Dimensions.create(data, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfully Created", doc })
        }
    })
})

router.get('/viewdimensions', (req, res) => {
    Dimensions.find((err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: doc })
        }
    });
})



router.get('/showenableddimensions', (req, res) => {
    Dimensions.find({ enabled: true })
    .sort({"_id":1})
    .exec((err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfull Enabled Dimensions:", doc })
        }
    })
})

//bulk dimesntions
router.post('/bulkDimensions',(req,res)=>{
    data.forEach((elem)=>{
        if(elem.hasOwnProperty('Dimension')){
            let dimension={
                name:elem.Dimension
            }
            console.log('dimension->',dimension)
            Dimensions.create(dimension,(err,doc)=>{
                if(err)return res.json({message:"Failed",err})
                else{
                    console.log('doc->',doc)
                }
            })
        }
    })
    setTimeout(()=>{
        return res.json({message:"Success"})
    },5000)
})


router.post('/changedimensionname',(req,res)=>{
    _id=req.body.dimensionid
    Dimensions.findByIdAndUpdate(_id,{name:req.body.newdimensionname},{new:true},(err,updatedimensionname)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Updated Dimension Name",updatedimensionname})
        }
    })
})
module.exports = router