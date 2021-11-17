const express=require('express')
const router=express.Router()
const Answers=require('../models/Answers')
router.get('/getanswers',(req,res)=>{
    Answers.find((err,data)=>{
        if (err) {
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Successfull",data})
        }
    })
})
module.exports=router