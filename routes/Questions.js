const express = require('express');
const router = express.Router();
const questions = require('../models/Questions')
const strands = require('../models/Strands')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Answers = require('../models/Answers')
const sets = require('./questions.json').data;
const Assessment = require('../models/Assessment');
const Questions = require('../models/Questions');
router.post('/addquestion', (req, res) => {
    let data = {
        text: req.body.text,
        strand: req.body.strandid
    }
    questions.create(data, (err, doc) => {
        if (err) console.log(err);
        else {
            strands.findByIdAndUpdate(req.body.strandid, { $push: { question: doc._id } }).exec((er, dc) => {
                if (er) console.log(er);
                else res.send(doc)
            })

        };
    })
})

router.post('/disablequestion', async (req, res) => {
    questions.findByIdAndUpdate(req.body.id, { enabled: req.body.enabled }, { new: true }).exec((err, doc) => {
        if (err) console.log(err);
        else {
            res.send(doc);
        };
    });
});


router.get('/showenable', (req, res) => {
    questions.find({ enabled: true }).sort({"dimensionid":1})
    .populate({ 
        path: 'strand',
        populate: {
          path: 'dimension',
          model: 'dimensions'
        } 
     })
    .exec((err, doc) => {
        if (err) console.log(err);
        else res.send(doc)
    })
})

router.post('/questionshow', (req, res) => {
    questions.find().exec((err, doc) => {
        if (err) console.log(err);
        else {
            res.send(doc)
        }
    })
})

//bulk dimesntions
router.post('/bulkQuesions', (req, res) => {
    sets.forEach((elem) => {
        if (elem.hasOwnProperty('text')) {
            console.log('elem->', elem.strand)
            // strands.find({name:elem.strand }).exec((err,doc)=>{
            //     if(err)return res.json({message:"failed",err})
            //     else{
            //         console.log('doccc->',doc._id)
            //         let question = {
            //             text: elem.text,
            //             strand:doc._id
            //         }
            //         questions.create(question, (errr, question) => {
            //             if (errr) return res.json({ message: "failed", errr })
            //             else {
            //                 strands.findByIdAndUpdate(doc._id, { question: question._id }, { new: true }).exec((er, str) => {
            //                     if (er) return res.json({ message: "failed", er })
            //                     else {
            //                         console.log('data->', str)
            //                     }

            //                 })
            //             }
            //         })
            //     }
            // })
            strands.findOne({ name: elem.strand }).exec((err, doc) => {
                if (err) console.log(err);
                else {
                    // console.log("doc->",doc.name)
                    // let id= doc._id
                    let data = {
                        text: elem.text,
                        strand: doc._id,
                        dimensionid:doc.dimension
                    }
                    console.log(data);
                    questions.create(data, (er, que) => {
                        if (er) console.log(er);
                        else {
                            console.log(que._id);
                            strands.findByIdAndUpdate(doc.id, { question: que._id }, { new: true }).exec((errr, str) => {
                                if (errr) console.log(errr);
                                else console.log(str);
                            })
                        }
                    })
                }
            })
        }
    })
    setTimeout(() => {
        return res.json({ message: "Success" })
    }, 15000)
})
router.get('/', (req, res) => {
    strands.find().exec((err, doc) => {
        if (err) console.log(err);
        else res.send(doc)
    })
})
function getSum(total, doc) {
    return total + doc.weightage;
}

router.post('/calculation', async (req, res) => {
    let result = 0
    let ress = 0
    let per = []
    const data = req.body.data
    const arr = data.map(d => {
        return new ObjectId(d.question)
    })
    let dat = req.body.data
    let assessmentid = new ObjectId()
    let values = dat.map((obj) => {
        obj.assessmentid = assessmentid
        return obj
    })
    
    Answers.create(values, (err, docss) => {
        if (err) return res.json({ message: "Failed", err })
        else {
            // console.log(docs)
            strands.find({ question: { $in: arr } }).exec(async (Err, docs) => {
                if (Err) return console.log({ message: "faied", Err })
                else {
                    let ids = []
                    docs.forEach((dat) => {
                        let dimension = dat._doc.dimension.toString()
                        if (ids.indexOf(dimension) < 0) {
                            ids.push(dimension)
                        }
                    })
                    if (ids.length > 0) {
                        let val = await ids.map((data) => {
                            return {
                                dimension: data,
                                strands: docs.filter((str) => str._doc.dimension.toString() == data),
                                sumOfWeightage: docs.filter((str) => str._doc.dimension.toString() == data).reduce(getSum, 0),
                            }
                        })
                        // console.log('valll->',val)
                        val.forEach(async (cal) => {
                            let ress = 0
                            let result = 0;
                            for (let c of cal.strands) {
                                console.log('c--->',c)
                                await Answers.findOne({ question: c.question,assessmentid }).exec((err, ta) => {
                                    if (err) console.log(err);
                                    else {
                                        ress = ress + (ta.answer * c.weightage)
                                        // console.log('ressssasss->',ress)
                                        // console.log('weightage->',c.weightage)
                                    }
                                })
        
                            }
                            setTimeout(() => {
                                // console.log(ress);
                                // console.log(cal.sumOfWeightage);
                                result = ress / cal.sumOfWeightage
                                // console.log('result--->',result);
                                // console.log('resssss->',ress)
                                // console.log('summmmm->',cal.sumOfWeightage)
                                // console.log('result->',result)
        
                                let d = {
                                    dimensionid: cal.dimension,
                                    percent:Math.round(result)
                                }
                                per.push(d)
                               
                                
                            }, 2000)
        
        
                        })
                        
                        setTimeout(() => {
                            // console.log('per--------->sdfs',per);
                            Assessment.findByIdAndUpdate(req.body.assessid,{$set:{assessment:per}},{new:true},(err,doc)=>{
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    return res.json({doc,docss})
                                }
                            })
                        }, 10000)
                       
                    }
                    
                }
            })
        }
    })
})

// let dataa=req.body
//                     dataa.map(ss=>{
//                         Assessment.findByIdAndUpdate(ss.assessid,{$push:{assessment:per}},{new:true},(err,doc)=>{
//                             if(err){
//                                 console.log(err)
//                             }
//                             else{console.log(doc)}
//                         })
//                     })







// router.post('/calculation', async (req, res) => {
//     let result = 0
//     let ress = 0
//     let per = []
//     const data = req.body.data
//     const arr = data.map(d => {
//         return new ObjectId(d.question)
//     })
//     console.log('arrr--',arr)
//     let dat = req.body.data
//     let assessmentid = new ObjectId()
//     let values = dat.map((obj) => {
//         obj.assessmentid = assessmentid
//         return obj
//     })
//     Answers.create(values, (err, docs) => {
//         if (err) return res.json({ message: "Failed", err })
//         else {
//             console.log('answers----',docs)
//         }
//     })
//     strands.find({ question: { $in: arr } }).exec(async (Err, docs) => {
//         if (Err) return console.log({ message: "faied", Err })
//         else {
//             let ids = []
//             console.log('sdfsido')
//             docs.forEach((dat) => {
//                 let dimension = dat._doc.dimension.toString()
//                 if (ids.indexOf(dimension) < 0) {
//                     ids.push(dimension)
//                 }
//             })
//             if (ids.length > 0) {
//                 let val = await ids.map((data) => {
//                     return {
//                         dimension: data,
//                         strands: docs.filter((str) => str._doc.dimension.toString() == data),
//                         sumOfWeightage: docs.filter((str) => str._doc.dimension.toString() == data).reduce(getSum, 0),
//                     }
//                 })
//                 let ress = 0
//                 let result = 0;
//                 // let prom= new Promise(function(resolve,reject){
//                     if(val){
//                 val.forEach(async (cal,index) => {
                    
//                     for (let c of cal.strands) {
//                         const r = await Answers.findOne({ question: c.question }).exec((err, ta) => {
//                             if (err) console.log(err);
//                             else {
//                                 ress = ress + (ta.answer * c.weightage)
//                             }
//                         })

//                     }
                    
//                     function total(ress) {
//                         console.log('Starting ...')
                    
//                         resss.forEach(async (ress) => {
//                             let completed = await runcalculation(ress)
//                             console.log(completed)
//                         })
//                     }

//                  })//val ki body band
              
//             }
//             //})
            
//             async function runcalculation(ress) {
//                 return new Promise((resolve, reject) => {
//                     console.log(ress);
//                     console.log(cal.sumOfWeightage);
//                     result = ress / cal.sumOfWeightage
//                     // console.log(c.weightage);
    
//                     let d = {
//                         dimension: cal.dimension,
//                         percent: result
//                     }
    
//                     per.push(d)
//                     setTimeout(completeTask, 3000, per, resolve)
//                 })
//             }
//             function completeTask(task, callback) {
            
//                 callback(`Completed${task}`)
//             }
            
//             }//if body closed
//         }//else body
//     })//strands body closed
// })//route body closed


router.get('/viewquestionwithdimandstrandname',(req,res)=>{
    strands.find()
    .populate('question',"text")
    .populate('dimension',"name")
    .exec((err,docs)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Success",docs})
        }
    })
})

router.get('/updatequestions',(req,res)=>{
    Questions.find()
    .populate('strand',"dimension")
    .exec((err,questions)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            questions.forEach(a=>{
                // console.log(a.strand.dimension)
                // console.log(a.strand._id)
                let _id=a._id
                
                Questions.findByIdAndUpdate(_id,{dimensionid:a.strand.dimension},{new:true},(err,docs)=>{
                    if(err){
                        return res.json({message:"Failed",err})
                    }
                    else{
                        console.log(docs)
                    }
                })
            })
            // return res.json({message:"Success",questions})
        }
    })
})

router.get('/getdata',(req,res)=>{
    Assessment.findOne({_id:req.body.assessmentid})
    .populate('userid','name')
    .populate('answers.dimensionid',"name")
    .populate('answers.question',"text")
    .exec((err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Success",doc})
        }
    })
})

router.post('/viewquestionsbydimensionid',(req,res)=>{
    questions.find({dimensionid:req.body.id})
    .populate('dimensionid',"name")
    .exec((err,docs)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Success",docs})
        }
    })
})

router.post('/viewquestionsbydimensionids',(req,res)=>{
    console.log(req.body.id)
    id=req.body.id
    let docs=[]
    id.forEach(a=>{
        questions.find({dimensionid:a})
        .populate('dimensionid',"name")
        .exec((err,doca)=>{
            if(err){
                return res.json({message:"Failed",err})
            }
            else{
                // setTimeout(() => {
                    doca.forEach(e=>{
                        docs.push(e)
                    })
                    
                // }, 3000);
            }
        })
    })
    setTimeout(() => {
        return res.json({message:"Success",docs})
    }, 2000);
  
})

router.post('/getsinglequestion',(req,res)=>{
    _id=req.body.questionid
    Questions.findById(_id,(err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Successfull,Single Question Data",doc})
        }
    })
})

module.exports = router