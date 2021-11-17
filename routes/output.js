const express = require('express')
const router = express.Router();
const Assessments = require('../models/Assessment')
const Answers = require('../models/Answers')
const Dimensions = require('../models/Dimensions')
const Strands = require('../models/Strands')
const Remarks = require('../models/Remarks')
var mongoose = require('mongoose');


// router.post('/getremarks',(req,res)=>{
//     let response = []
//     let di=[]
//     let name
//     Answer.findById(req.body.id)
//     .exec((err,re)=>{
//         if (err) console.log(err);
//         else{
//             for (const s of re.answers) {
//                 let i=[]
//                 Strands.findOne({question:s.question})
//             .populate('dimension')
//             .populate('capabilities')
//             .exec((er,rs)=>{
//                 if(er) console.log(er);
//                 else{
//                     for (const a of rs.capabilities) {
//                         // console.log(a.remarks);
//                         for(let c=0;c<a.remarks.length;c++){
//                             console.log(a.remarks[c].level);
//                             if(a.remarks[c].level===s.answer){
//                             console.log('fff');
//                             if(a.remarks[c+1]!==null){
//                                     i.push({"capability":a.name,remarks:a.remarks[c],nextremark:a.remarks[c+1]})
//                                 }else{
//                                     i.push({"capability":a.name,remarks:d})
//                                 }
//                             }
//                         }
//                     }
//                     // for (const d of a.remarks) {
//                         //     if(s.answer===d.level){
//                         //         i.push({"capability":a.name,remarks:d,nextremark:d+1})
//                         //     }

//                         // console.log('aa');
//                         // }
//                     setTimeout(() => {
//                         if(name!==rs.dimension.name){
//                             name=rs.dimension.name
//                             let d={
//                                 dimension:name,
//                                 strandd:response
//                             }
//                             di.push(d)
//                             setTimeout(() => {
//                                 response=[]
//                             }, 200);
//                             }else{
//                                 console.log(i);
//                                 let data={
//                                     name:rs.name,
//                                     remarks_with_cap:i
//                                 }
//                                 response.push(data)
//                             }

//                     }, 200);
//                 }
//             })
//         }
//     }

//     })
//     setTimeout(()=>{
//         return res.json({data:di})
//     },3000)
// })

router.get('/as', (req, res) => {
    Answer.find().exec((err, doc) => {
        if (err) console.log(err);
        else res.send(doc)
    })
})
// router.post('/getremarks',(req,res)=>{
//     assessmentid=req.body.id    
//     Assessments.findOne({_id:assessmentid},(err,assessment)=>{
//         if(err){
//             return res.json({message:"Failed",err})
//         }
//         else{
//             //yahan assessment ka data mil gaya ok
//             let questionsmatchstrand=[]
//             console.log(assessment.answers.length)
//             // assessment.selecteddimensions.map(dim=>{
//                 assessment.answers.forEach(ans=>{
//                     Strands.findOne({question:ans.question})
//                         .populate('capabilities',"remarks")
//                         .populate('dimension',"name")
//                         .exec((err,stranddata)=>{
//                         if(err){
//                             return res.json({message:"Failed",err})
//                         }
//                         else{
//                                 questionsmatchstrand.push(stranddata)
//                             }
//                     })
//                 }),setTimeout(() => {
//                     console.log(questionsmatchstrand)
//                     return res.json({message:"Strand Data Match Questions",questionsmatchstrand})
//                     }, 2000);
//             //})

//         }
//     })
// })

// router.post('/getremarks',(req,res)=>{
//     let capp=[]
//     let stran=[]
//     let di=[]
//     Assessments.findById(req.body.id)
//     .exec((err,doc)=>{
//         doc.selecteddimensions.forEach(dim=>{
//             dimension.findById(dim)
//             .populate({ 
//                 path: 'strands',
//                 populate: {
//                   path: 'capabilities',
//                   model: 'capabilities'
//                 } 
//              })
//             .exec((er,dc)=>{
//                 if (er) console.log(er);
//                 else {
//                     stran=[]
//                     Answer.find({assessmentid:req.body.id})
//                     .exec((erro,docc)=>{
//                         docc.forEach(ans=>{
//                         dc.strands.forEach(str=>{
//                             capp=[]
//                             console.log("strnad-->",str.question)
//                             console.log("answer-->",ans.question)
//                             if(str.question==ans.question){
//                                 console.log("a");
//                                 str.capabilities.forEach(cap=>{
//                                     cap.remarks.forEach(rem=>{
//                                 console.log("b");

//                                         if(rem.level===ans.answer){
//                                 console.log("c");

//                                             if(ans.answer<5){
//                                                 capp.push({"capability":cap.name,"cureent remarks":rem,"next remarks":cap.remarks[ans.answer]})
//                                             }
//                                             else {
//                                                 capp.push({"capability":cap.name,"cureent remarks":rem})
//                                             }
//                                         }
//                                     })
//                                 })
//                             }
//                             setTimeout(() => {
//                                 // console.log(capp);
//                                 let data={
//                                     name:str.name,
//                                     "capabilities":capp
//                                 }
//                                 capp=[]
//                                 stran.push(data)
//                             }, 300);
//                         })
//                     })
//                     })
//                 }
//                 setTimeout(() => {
//                     let data={
//                         dimension:dc.name,
//                         strands:stran
//                     }
//                     stran=[]
//                     di.push(data)
//                 }, 500);
//             })
//         })
//     })
//     setTimeout(() => {
//         res.send(di)
//     }, 5000);
// })





// router.post('/getremarks',async(req,res)=>{
//     let i=[]
//     let stra=[]
//     let di=[]
//     let k
//     Assessments.findById(req.body.id)
//     .populate("answers")
//     .exec(async(err,doc)=>{
//         if(err) console.log(err);
//         else {
//             doc.selecteddimensions.map(async dim=>{
//                 dimension.findById(dim)
//                 .populate({ 
//                     path: 'strands',
//                     populate: {
//                       path: 'capabilities',
//                       model: 'capabilities'
//                     } 
//                  })
//                 .exec(async (er,dc)=>{
//                     console.log("p");
//                     stra=[]
//                     let p=new Promise((ress,rej)=>{
//                         dc.strands.map(async stran=>{
//                             // console.log(stran);
//                              k=new Promise((reso,rej)=>{
//                                 Answer.findOne({$and:[{strandid:stran._id},{assessmentid:doc._id}]})
//                             .exec(async(errr,docc)=>{
//                                 if(errr) console.log(errr);
//                                 else{
//                                 if(docc!==null){
//                                     // console.log(docc);
//                                     // console.log("s");
//                                      i=[]
//                                    let s=await stran.capabilities.map(async cap=>{
//                                        let cc= await cap.remarks.map(async rem=>{
//                                             if (rem.level===docc.answer) {
//                                                 // console.log("f");
//                                                 if (cap.remarks[docc.answer]!==null) {
//                                                 // console.log("d");
//                                                     i.push({ "capability": cap.name, current_remarks: rem, nextremark: cap.remarks[rem.level]}) 
//                                                     return { "capability": cap.name, current_remarks: rem, nextremark: cap.remarks[rem.level]}
//                                             }
//                                                 else{  
//                                                     i.push({ "capability": cap.name, current_remarks: rem})    
//                                                     return { "capability": cap.name, current_remarks: rem}
//                                                 }
//                                             }
//                                         })
//                                         // console.log(cc);
//                                         return i
//                                     })
//                                     // console.log(s);
//                                     reso("done")
//                                 }
//                                 } 
//                          })
//                             })
//                             k.then(async o=>{
//                             let str=await{
//                             name:stran.name,
//                             remarks_with_cap:i
//                             }
//                             await stra.push(str)
//                             i=[]
//                             console.log(o);
//                             })
//                          setTimeout(async() => {
//                             // console.log(i);
//                             ress("2nd done")
//                            }, 400);  
//                         })
//                     })
//                     p.then(d=>{
//                        let dime={
//                             dimension:dc.name,
//                             strand:stra
//                         }
//                         di.push(dime)
//                         stra=[] 
//                         console.log(d);
//                     })
//                     // setTimeout(() => {
//                     //     // console.log(stra);

//                     // },300);
//             })
//                 })

//         }
//     })
//     setTimeout(() => {
//         // console.log(i);
//         res.send(di)
//     }, 3000);
// })

router.delete('/deleteanswer', (req, res) => {
    Answer.deleteMany({}, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Deleted Answers", doc })
        }
    })
})

router.post('/getremarks', (req, res) => {
    // let capp
    // let stra
    let di, st = []
    Assessments.findById(req.body.assessid)
        .populate({
            path: 'selecteddimensions',
            populate: {
                path: 'strands',
                model: 'strands',
                populate: {
                    path: 'capabilities',
                    model: 'capabilities'
                }
            }
        })
        .exec((err, dataa) => {
            if (err) {
                return res.json({ message: "Failed", err })
            }
            else {
                di = dataa.selecteddimensions.map(dim => {
                    var id = mongoose.Types.ObjectId();
                    let strandssss = dim.strands.filter(str => str.question !== undefined)
                    console.log('str len->',strandssss.length)
                    let stra = strandssss.map(async (str,index) => {
                        const ans = await Answers.findOne({ question: str.question, assessmentid: req.body.assessid })
                        let capp = str.capabilities.map(cap => {
                            if (ans.answer < 5) {
                                
                                let s = {
                                    name: cap.name,
                                    current_remarks: cap.remarks[ans.answer - 1].text,
                                    next_remarks: cap.remarks[ans.answer].text
                                }
                                return s
                            }
                            else {
                                let s = {
                                    name: cap.name,
                                    current_remarks: cap.remarks[ans.answer - 1].text
                                }
                                return s
                            }
                        })
                        if(index===0){
                            let data = {
                                _id:id,
                                assessmenid:req.body.assessid,
                                dimensionid:dim._id,
                                remarks:[
                                    {
                                        strand:str._id,
                                        remarks_with_capabilities:capp
                                    }
                                ]
                            }
                            // console.log('data---->',data)
                            Remarks.create(data,(errrr,remmm)=>{
                                if(errrr)return res.json({message:"Failed",err:errrr})
                            })
                        }else if(index>0){
                            let data = {
                                strand:str._id,
                                remarks_with_capabilities:capp
                            }
                            // console.log('updateeee-->',data)
                            Remarks.findByIdAndUpdate(id,{$push:{remarks:data}},{new:true},(errrr,remm)=>{
                                if(errrr)return res.json({message:"Failed",err:errrr})
                            })

                        }
                        return {
                            name: str.name,
                            cap_with_remarks: capp
                        }
                    })
                    // console.log("ksksks", st);
                    // console.log("strand--->", stra);
                    // let u = {
                    //     dimension: dim.name,
                    //     strands: stra
                    // }
                    // st = []
                    // return u
                })
            }
        })
    setTimeout(() => {
        // console.log(stra);
        res.json({message:"Success"})
    }, 15000);
    // return res.json({message:"Success",di})
})

router.post('/getremarksdata',(req,res)=>{
    console.log(req.body)
    id=req.body.assessid
    Remarks.find({assessmentid:id})
    .populate('assessmentid',"companyname")
    .populate('dimensionid',"name")
    .populate('remarks.strand',"name")
    .exec((err,data)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
            return res.json({message:"Success",data})
        }
    })
})
module.exports = router