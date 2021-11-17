//graph data
const express = require('express')
const router = express.Router()
const Assessments = require('../models/Assessment')
const Answer = require('../models/Answers')
const Dimensions = require('../models/Dimensions')
const Questions=require('../models/Questions')
const Strands = require('../models/Strands')
const mongoose = require('mongoose')
const Remarks = require('../models/Remarks')
const ChartJsImage = require('chartjs-to-image');
const path = require('path')
const fs = require('fs')
const uid = require('uid')
const nodemailer = require('nodemailer')
const PDFDocument = require("pdfkit-table");
const Assessment = require('../models/Assessment')
const myChart = new ChartJsImage();

router.get('/viewassessments', (req, res) => {
    Assessments.find((err, docs) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Suuccess Assessmets", docs })
        }
    })
})

router.post('/createassessment', (req, res) => {
    let data = {
        userid: req.body.userid,
        companyname: req.body.companyname,
        industry: req.body.industry,
        selecteddimensions: req.body.dimensions,
        region: req.body.region,
        revenue: req.body.revenue
    }
    Assessments.create(data, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Created", doc })
        }
    })
})

router.put('/giveanswerofquestion', (req, res) => {
    let _id = req.body.assessid
    let data = {
        assessmentid: req.body.assessid,
        question: req.body.question,
        answer: req.body.answer
    }
    let data1 = {
        dimensionid: req.body.dimensionid,
        assessmentid: req.body.assessid,
        question: req.body.question,
        answer: req.body.answer
    }
    Assessments.findByIdAndUpdate(_id, { $push: { answers: data } }, { new: true }, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            Answer.create(data, (err, answerdoc) => {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(data)
                    Strands.findOne({ question: data1.question })
                        .populate('capabilities')
                        .exec((err, stranddata) => {
                            if (err) { return res.json({ message: "Failed", err }) }
                            else {
                                let capp = stranddata.capabilities.map(cap => {
                                    if (data1.answer < 5) {

                                        let s = {
                                            name: cap.name,
                                            current_remarks: cap.remarks[data1.answer - 1].text,
                                            next_remarks: cap.remarks[data1.answer].text
                                        }
                                        return s
                                    }
                                    else {
                                        let s = {
                                            name: cap.name,
                                            current_remarks: cap.remarks[data1.answer - 1].text
                                        }
                                        return s
                                    }
                                })

                                Remarks.findOne({ assessmentid: data1.assessmentid, dimensionid: data1.dimensionid }, (err, remarksdata) => {
                                    if (err) { return res.json({ message: "Failed", err }) }
                                    else {
                                        if (remarksdata !== null) {
                                            let data2 = {
                                                strand: stranddata._id,
                                                remarks_with_capabilities: capp
                                            }
                                            // console.log('updateeee-->',data)
                                            Remarks.findOneAndUpdate({ assessmentid: data1.assessmentid, dimensionid: data1.dimensionid }, { $push: { remarks: data2 } }, { new: true }, (errrr, remm) => {
                                                if (errrr) return res.json({ message: "Failed", err: errrr })
                                                else { return res.json({ message: "Updated Assessment", doc }) }
                                            })
                                        }
                                        else {
                                            let data3 = {
                                                assessmentid: data1.assessmentid,
                                                dimensionid: data1.dimensionid,
                                                remarks: [
                                                    {
                                                        strand: stranddata._id,
                                                        remarks_with_capabilities: capp
                                                    }
                                                ]
                                            }
                                            // console.log('data---->',data)
                                            Remarks.create(data3, (errrr, remm) => {
                                                if (errrr) return res.json({ message: "Failed", err: errrr })
                                                else { return res.json({ message: "Updated Assessment", doc }) }
                                            })
                                        }
                                        // return res.json({message:"Updated Assessment",doc,answerdoc,stranddata,capp,remmm,remm})
                                    }
                                })

                                // return res.json({message:"Updated Assessment",doc,answerdoc,stranddata,capp,remm})
                            }
                        })
                }
            })
            // return res.json({ message: "Updated Assessment", doc })
        }
    })

})

router.delete('/deleteassessments', (req, res) => {
    Assessments.deleteMany({}, (err, docs) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Success", docs })
        }
    })
})

//original route ok
// router.get('/viewdimensionwisecompaniesdata', (req, res) => {
//     Dimensions.find({}).exec((err, docs) => {
//         if (err) return res.json({ message: "Failed", err })
//         else {
//             let resulttttt = []
//             docs.forEach((doc) => {
//                 let id = doc._id
//                 let name=doc.name.toString()
//                 console.log('idddd->',id)
//                 Assessments.aggregate
//                     ([
//                         { $unwind: "$assessment" },

//                         { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" } } },
//                         { $match: {"_id.dimid":id} },

//                         {
//                             $bucket: {
//                                 groupBy: "$_id.percent"
//                                 , boundaries: [1, 2, 3, 4, 5],
//                                 default: "other",
//                                 output: {"count": { $sum: 1 }}
//                             }
//                         }
//                     ]).exec((err, res) => {
//                         if (err) {
//                             return res.json({ message: "Failed", err })
//                         }
//                         else {
//                            console.log("res",res)
//                            console.log(res.length)



//                            if(res.length!==5){


//                         let gul=[]
//                         res.map(sd=>{
//                             gul.push(sd._id)
//                         })

//                         let a = gul,
//                         count = 5,
//                         missing = []

//                         for (let i = 1; i <= count; i++) {
//                         if (a.indexOf(i) === -1) {
//                             missing.push(i)
//                             res.push({
//                                 _id:i,
//                                 count:0
//                             })
//                         }
//                         }

//                         console.log(missing)



//                             console.log('res--->',res)
//                             let obj = {
//                                 dimension:id,
//                                 dimensionname:name,
//                                 res
//                             }

//                             resulttttt.push(obj)
//                             // console.log(missing)

//                           }     

//                         }

//                     })
//             })
//             setTimeout(()=>{
//                 return res.json({message:"Success",resulttttt})
//                 // return res.json({message:"dsds",resd})
//             },5000)
//         }
//     })
// })

router.post('/viewassessmentbyuserid', (req, res) => {

    Assessments.find({ userid: req.body.userid }, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            // return res.json({ message: "Success", doc })
            let i = []
            Dimensions.find({}).exec((err, docs) => {
                if (err) return res.json({ message: "Failed", err })
                else {
                    let resulttttt = []
                    console.log(docs.length)
                    docs.forEach((doc) => {
                        let id = doc._id
                        let name = doc.name.toString()
                        console.log('idddd->', id)

                        Assessments.aggregate
                            ([
                                { $unwind: "$assessment" },

                                { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" }, count: { $sum: 1 } } },
                                { $match: { "_id.dimid": id } },
                                { $group: { _id: { _id: "$_id.percent", count: "$count" } } },
                                // {
                                //     $bucket: {
                                //         groupBy: "$_id.level"
                                //         , boundaries: [1,2,3,4,5],
                                //         default: "other",
                                //         output: { "count": { $sum: 1 } }
                                //     }
                                // }


                            ]).exec((err, red) => {

                                if (err) {
                                    return res.json({ message: "Failed", err })
                                }
                                else {
                                    console.log("red", red)
                                    console.log(red.length)



                                    if (red.length !== 5) {


                                        let gul = []
                                        red.map(sd => {
                                            gul.push(sd._id._id)
                                        })

                                        let a = gul,
                                            count = 5,
                                            missing = []

                                        for (let i = 1; i <= count; i++) {
                                            if (a.indexOf(i) === -1) {
                                                missing.push(i)
                                                red.push({
                                                    _id: {
                                                        _id: i,
                                                        count: 0
                                                    }
                                                })

                                            }

                                        }

                                        console.log(missing)



                                        console.log('res--->', red)
                                        let obj = {
                                            dimension: id,
                                            dimensionname: name,
                                            red
                                        }


                                        resulttttt.push(obj)
                                        // console.log(missing)

                                    }
                                    else {
                                        console.log('res--->', red)
                                        let obj = {
                                            dimension: id,
                                            dimensionname: name,
                                            red
                                        }
                                        resulttttt.push(obj)
                                    }

                                }

                            })

                    })

                    setTimeout(() => {
                        return res.json({ message: "Success", doc, resulttttt })
                        // return res.json({message:"dsds",resd})
                    }, 5000)
                }
            })
        }
    })
})

router.post('/getlength', (req, res) => {
    _id = req.body.assessid
    Assessments.findByIdAndUpdate(_id, { $push: { selecteddimensions: req.body.dimensionid } }, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Success", doc })
        }
    })
})

router.get('/viewdimensionwisecompaniesdata', (req, res) => {
    let i = []
    Dimensions.find({}).exec((err, docs) => {
        if (err) return res.json({ message: "Failed", err })
        else {
            let resulttttt = []
            console.log(docs.length)
            docs.forEach((doc) => {
                let id = doc._id
                let name = doc.name.toString()
                console.log('idddd->', id)

                Assessments.aggregate
                    ([
                        { $unwind: "$assessment" },

                        { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" }, count: { $sum: 1 } } },
                        { $match: { "_id.dimid": id } },
                        { $group: { _id: { _id: "$_id.percent", count: "$count" } } },
                        // {
                        //     $bucket: {
                        //         groupBy: "$_id.level"
                        //         , boundaries: [1,2,3,4,5],
                        //         default: "other",
                        //         output: { "count": { $sum: 1 } }
                        //     }
                        // }


                    ]).exec((err, red) => {

                        if (err) {
                            return res.json({ message: "Failed", err })
                        }
                        else {
                            console.log("red", red)
                            console.log(red.length)



                            if (red.length !== 5) {


                                let gul = []
                                red.map(sd => {
                                    gul.push(sd._id._id)
                                })

                                let a = gul,
                                    count = 5,
                                    missing = []

                                for (let i = 1; i <= count; i++) {
                                    if (a.indexOf(i) === -1) {
                                        missing.push(i)
                                        red.push({
                                            _id: {
                                                _id: i,
                                                count: 0
                                            }
                                        })

                                    }

                                }

                                console.log(missing)



                                console.log('res--->', red)
                                let obj = {
                                    dimension: id,
                                    dimensionname: name,
                                    red
                                }


                                resulttttt.push(obj)
                                // console.log(missing)

                            }
                            else {
                                console.log('res--->', red)
                                let obj = {
                                    dimension: id,
                                    dimensionname: name,
                                    red
                                }
                                resulttttt.push(obj)
                            }

                        }

                    })

            })

            setTimeout(() => {
                return res.json({ message: "Success", resulttttt })
                // return res.json({message:"dsds",resd})
            }, 5000)
        }
    })
})


// router.post('/viewassessmentbyassessmentid',(req,res)=>{
//     _id=req.body.assessmentid
//     Assessments.findById(_id)
//         .populate('assessment.dimensionid')
//         .exec((err,assessdoc)=>{
//         if(err)
//         {
//             return res.json({message:"Failed",err})
//         }
//         else
//         {
//             let i = []
//             Dimensions.find({}).exec((err, docs) => {
//                 if (err) return res.json({ message: "Failed", err })
//                 else {
//                     let resulttttt = []
//                     console.log(docs.length)
//                     docs.forEach((doc) => {
//                         let id = doc._id
//                         let name = doc.name.toString()
//                         console.log('idddd->', id)

//                         Assessments.aggregate
//                             ([
//                                 {$match:{"_id":assessdoc._id}},
//                                 { $unwind: "$assessment" },
//                                 { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" }, count: { $sum: 1 } } },
//                                 { $match: { "_id.dimid": id } },
//                                 { $group: { _id:{_id:"$_id.percent", count: "$count" } } },
//                             ]).exec((err, red) => {

//                                 if (err) {
//                                     return res.json({ message: "Failed", err })
//                                 }
//                                 else {
//                                     console.log("red", red)
//                                     console.log(red.length)



//                                     if (red.length >0 && red.length<5) {


//                                         let gul = []
//                                         red.map(sd => {
//                                             gul.push(sd._id._id)
//                                         })

//                                         let a = gul,
//                                             count = 5,
//                                             missing = []

//                                         for (let i = 1; i <= count; i++) {
//                                             if (a.indexOf(i) === -1) {
//                                                 missing.push(i)
//                                                 red.push({
//                                                     _id:{
//                                                     _id: i,
//                                                     count: 0}
//                                                 })

//                                             }

//                                         }

//                                         console.log(missing)



//                                         console.log('res--->', red)
//                                         let obj = {
//                                             dimension: id,
//                                             dimensionname: name,
//                                             red
//                                         }


//                                         resulttttt.push(obj)
//                                         // console.log(missing)

//                                     }
//                                     else if(red.length==0){
//                                         let gull = []
//                                         red.map(sd => {
//                                             gull.push(sd._id._id)
//                                         })

//                                         let a = gull,
//                                             countt = 5,
//                                             missingg = []

//                                         for (let i = 1; i <= countt; i++) {
//                                             if (a.indexOf(i) === -1) {
//                                                 missingg.push(i)
//                                                 red.push({
//                                                     _id:{
//                                                     _id: i,
//                                                     count: 0}
//                                                 })

//                                             }

//                                         }

//                                         console.log(missingg)



//                                         console.log('res--->', red)
//                                         let obj = {
//                                             dimension: id,
//                                             dimensionname: name,
//                                             red
//                                         }


//                                         resulttttt.push(obj)
//                                         // console.log(missing)
//                                     }
//                                     else{
//                                         console.log('res--->', red)

//                                         let obj = {
//                                             dimension: id,
//                                             dimensionname: name,
//                                             red
//                                         }
//                                         resulttttt.push(obj)
//                                     }

//                                 }


//                             })

//                     })
//                     setTimeout(() => {
//                                 return res.json({ message: "Success",assessdoc,resulttttt })
//                                 // return res.json({message:"dsds",resd})
//                             }, 5000)
//                             console.log("reddd",resulttttt)

//                     // setTimeout(() => {
//                     //     return res.json({ message: "Success", assessdoc,red })
//                     //     // return res.json({message:"dsds",resd})
//                     // }, 5000)
//                 }
//             })
//             // return res.json({message:"Assessment",doc})
//         }
//     })
// })

router.post('/viewassessmentbyassessmentid', (req, res) => {
    _id = req.body.assessmentid
    Assessments.findById(_id)
        .populate('assessment.dimensionid')
        .exec((err, assessdoc) => {
            if (err) {
                return res.json({ message: "Failed", err })
            }
            else {
                let i = []
                Dimensions.find({}).exec((err, docs) => {
                    if (err) return res.json({ message: "Failed", err })
                    else {
                        let resulttttt = []
                        console.log(docs.length)
                        docs.forEach((doc) => {
                            let id = doc._id
                            let name = doc.name.toString()
                            console.log('idddd->', id)

                            Assessments.aggregate
                                ([
                                    // {$match:{"_id":assessdoc._id}},
                                    { $unwind: "$assessment" },
                                    { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" }, count: { $sum: 1 } } },
                                    { $match: { "_id.dimid": id } },
                                    { $group: { _id: { _id: "$_id.percent", count: "$count" } } },
                                ]).exec((err, red) => {

                                    if (err) {
                                        return res.json({ message: "Failed", err })
                                    }
                                    else {
                                        console.log("red", red)
                                        console.log(red.length)



                                        if (red.length !== 5) {


                                            let gul = []
                                            red.map(sd => {
                                                gul.push(sd._id._id)
                                            })

                                            let a = gul,
                                                count = 5,
                                                missing = []

                                            for (let i = 1; i <= count; i++) {
                                                if (a.indexOf(i) === -1) {
                                                    missing.push(i)
                                                    red.push({
                                                        _id: {
                                                            _id: i,
                                                            count: 0
                                                        }
                                                    })

                                                }

                                            }

                                            console.log(missing)



                                            console.log('res--->', red)
                                            let obj = {
                                                dimension: id,
                                                dimensionname: name,
                                                red
                                            }


                                            resulttttt.push(obj)
                                            // console.log(missing)

                                        }

                                        else {
                                            console.log('res--->', red)

                                            let obj = {
                                                dimension: id,
                                                dimensionname: name,
                                                red
                                            }
                                            resulttttt.push(obj)
                                        }

                                    }


                                })

                        })
                        setTimeout(() => {
                            return res.json({ message: "Success", assessdoc, resulttttt })
                            // return res.json({message:"dsds",resd})
                        }, 5000)
                        console.log("reddd", resulttttt)

                        // setTimeout(() => {
                        //     return res.json({ message: "Success", assessdoc,red })
                        //     // return res.json({message:"dsds",resd})
                        // }, 5000)
                    }
                })
                // return res.json({message:"Assessment",doc})
            }
        })
})


router.post('/giveassessidandgenerategraph', (req, res) => {
    if (req.body.assessid) {
        let i = []
        
        Dimensions.find({}).exec((err, docs) => {
            if (err) return res.json({ message: "Failed", err })
            else {

                let gg = []
                let resulttttt = []
                let rn
                let filePath
                let mergedArr=[] 
                let cvc=0
                docs.forEach((doc) => {
                    let id = doc._id
                    let name = doc.name.toString()
                    

                    Assessments.aggregate
                        ([
                            { $unwind: "$assessment" },

                            { $group: { _id: { dimid: "$assessment.dimensionid", percent: "$assessment.percent" }, count: { $sum: 1 } } },
                            { $match: { "_id.dimid": id } },
                            { $group: { _id: { _id: "$_id.percent", count: "$count" } } },
                            // {
                            //     $bucket: {
                            //         groupBy: "$_id.level"
                            //         , boundaries: [1,2,3,4,5],
                            //         default: "other",
                            //         output: { "count": { $sum: 1 } }
                            //     }
                            // }


                        ]).exec((err, red) => {

                            if (err) {
                                return res.json({ message: "Failed", err })
                            }
                            else {

                                



                                if (red.length !== 5) {


                                    let gul = []
                                    red.map(sd => {
                                        gul.push(sd._id._id)
                                    })

                                    let a = gul,
                                        count = 5,
                                        missing = []

                                    for (let i = 1; i <= count; i++) {
                                        if (a.indexOf(i) === -1) {
                                            missing.push(i)
                                            red.push({
                                                _id: {
                                                    _id: i,
                                                    count: 0
                                                }
                                            })

                                        }

                                    }

                                    // console.log(missing)



                                    // console.log('res--->', red)


                                    // red.forEach(sd=>{
                                    //     dn.push(sd._id.count)
                                    // })
                                    let obj = {
                                        dimension: id,
                                        dimensionname: name,
                                        red
                                    }


                                    resulttttt.push(obj)
                                    // console.log(missing)

                                }
                                else {
                                    // console.log('res--->', red)
                                    let obj = {
                                        dimension: id,
                                        dimensionname: name,
                                        red
                                    }
                                    resulttttt.push(obj)
                                }
                                let reddata
                                let leveldata
                                let points
                                let shoints
                                // console.log(resulttttt.length)
                                resulttttt.forEach(a => {
                                    czxc = a.red.sort(function (a, b) { return parseFloat(a._id._id) - parseFloat(b._id._id) })
                                    reddata = czxc.map(b => {
                                        return b._id.count
                                    })
                                    leveldata = czxc.map(bbb => {

                                        return bbb._id._id
                                    })

                                    console.log("sort", czxc)
                                    rn = Math.floor((Math.random() * 1000000) + 1);
                                    filePath = __dirname + '/../../assessmentfiles/' + rn + '.png'.toString()
                                    console.log('pattthhh->', filePath)
                                    
                                    //graph generate ka code

                                    //   res.send(myChart)


                                })//foreach yahan band
                                let graphdata = {
                                    dimensionid:id,
                                    dimensionname: name,
                                    image: rn + ".png"
                                }

                                gg.push(graphdata)
                                // console.log("gg", gg)
                                Assessments.findByIdAndUpdate(req.body.assessid, { graph: gg }, { new: true }, (err, g) => {
                                    if (err) {
                                        return res.json({ message: "Failed", err })
                                    }
                                    else{
                                        
                                        console.log("res",resulttttt)
                                        console.log("czxc",czxc)
                                        filter(resulttttt,g)
                                        
                                    }
                                })
                                const filter=(results,g)=>{
                                       
                                    g.assessment.map(data=> {
                                      results.map(item=> {
                                        //   console.log("data",data)
                                        //   console.log("item",item)
                                        if (data.dimensionid.toString() === item.dimension.toString()) {
                                          
                                          mergedArr.push({ dimension:item.dimension,dimensionname:item.dimensionname, percent: data.percent,res:czxc });
                                          
                                          // mergedArr.push({ ...item, percent: data.percent,res:sortAsc(item.red) });
                                        }
                                      });
                                    });
                                    console.log('mergedArrr',mergedArr);
                                    
                                  }
                                    
                                        myChart.setConfig({
                                            type: "horizontalBar",
                                            data: {
                                                labels: leveldata, datasets: [{
                                                    label: `${name}`, data: reddata, backgroundColor: ["#91c788", "#91c788", "#91c788", "#91c788", "#91c788"],
                                                    hoverBackgroundColor: ["#66A2EB", "#FCCE56", "#FCCE55", "#F31EF6", "#F6F01E"]
                                                }],
                                            },
                                            options: {
                                                scales: {
                                                    xAxes: [{
                                                        stacked: true
                                                    }],
                                                    yAxes: [{
                                                        ticks: {
                                                            min: 0 // Edit the value according to what you need
                                                        }
                                                    }]
                                                }, chartArea: {
                                                    backgroundColor: 'rgba(251, 85, 85, 0.4)'
                                                }
        
                                            }
                                        }).toFile(filePath);                           
                            }

                        })
                    

                })



                setTimeout(() => {
                    return res.json({ message: "Success", resulttttt })
                    // return res.json({message:"dsds",resd})
                }, 5000)
            }
        })
    }
    else {
        return res.json({ message: "Please give assessment id" })
    }
})

router.delete('/deletesingleassessment', (req, res) => {
    Assessments.findByIdAndDelete(req.body.assessid, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Successfully Deleted Assessment", doc })
        }
    })
})

router.post('/generatepdf', (req, res) => {
    id = req.body.assessid
    Assessment.findOne({ _id: id })
    .populate('assessment.dimensionid',"name")
    .exec((err, docc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            // filenamerandom=Math.floor(100000 + Math.random() * 900000);
            // const doc = new Pdfdocument

            //ub isko browser pe show karwana hai
            // let filePath = path.join(__dirname,'../'+'/images/' + filenamerandom.toString())+'.pdf'
            // console.log('filePath->',filePath)
            // doc.pipe(fs.createWriteStream(filePath))

            Remarks.find({ assessmentid: id })
                .populate('assessmentid', "companyname")
                .populate('dimensionid', "name")
                .populate('remarks.strand', "name")
                .exec((err, doccc) => {
                    if (err) {
                        return res.json({ message: "Failed", err })
                    }
                    else {
                        ramu = Math.floor(100000 + Math.random() * 900000)
                        let filePath = __dirname + '/../../assessmentfiles/' + ramu + '.pdf'.toString()
                        console.log(filePath)
                        const doc = new PDFDocument({ margin: 30, size: 'A4' });

                        doc.image(path.join(__dirname, '../' + '/images/' + 'logo_ks.png')
                            , 5, 5, {
                            // fit:[300,100],
                            height: 100,
                            width: 100
                        })

                        doc
                            .font('fonts/PalatinoBold.ttf')
                            .fontSize(10)
                            .text(' Assessment Generated PDF', 90, 50)


                        doc.pipe(fs.createWriteStream(filePath));

                        doc.moveTo(0, 80)
                            .lineTo(620, 80).stroke()

                        doc.moveDown()
                        doc.moveDown()
                        doc.moveDown()

                        const table = {
                            title: "Company Details",
                            headers: ["", ""],
                            rows: [
                                ["Company Name", docc.companyname],
                                ["Industry", docc.industry],
                                ["Revenue", docc.revenue],
                                ["Region", docc.region],
                            ],
                        };
                        doc.table(table, {
                            // A4 595.28 x 841.89 (portrait) (about width sizes)
                            width: 300,
                            //columnsSize: [ 200, 100, 100 ],
                        });

                        
                            dsd=docc.assessment.map(cd=>{
                                return [cd.dimensionid.name,cd.percent]
                            })
                        
                            doc.moveDown()

                        const sable = {
                            title: "You Company's Filled Dimension Levels",
                            headers: ["", ""],
                            rows: dsd
                        };
                        doc.table(sable, {
                            // A4 595.28 x 841.89 (portrait) (about width sizes)
                            width: 300,
                            //columnsSize: [ 200, 100, 100 ],
                        });


                        docc.selecteddimensions.forEach(djsd=>{
                        docc.graph.map(e => {
                            if(djsd.toString()===e.dimensionid.toString()){
                            doc.addPage()
                            doc.fontSize(30);
                            doc.text(`${e.dimensionname}`, {
                                width: 500,
                                align: 'center'
                            }
                            );

                            doc.moveDown()
                            doc.moveDown()
                            doc.moveDown()

                            doc.image(path.join(__dirname, '../../assessmentfiles/' + e.image)
                                , 170, 100, {
                                height: 250,
                                width: 250
                            })
                        }
                        })
                    })
                        doccc.forEach(jj => {
                            console.log(jj)

                            jj.remarks.map((kk, index) => {
                                return doc.addPage(),
                                    doc.fontSize(20),
                                    doc.text(`${jj.dimensionid.name}`, {
                                        width: 500,
                                        align: 'center'
                                    }
                                    ),
                                    doc.fontSize(20),
                                    doc.text(`Strand ${index + 1} ${kk.strand.name}`, {
                                        width: 500,
                                        align: 'center'
                                    }
                                    ),
                                    kk.remarks_with_capabilities.map((pp, index) => {
                                        if(pp.next_remarks){
                                        return doc.fontSize(10),
                                            doc.moveDown(),
                                            doc.text(`Capability ${index + 1} ${pp.name}`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            ),
                                            doc.fontSize(10),
                                            doc.text(`Current Remarks: ${pp.current_remarks}`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            ),
                                            doc.moveDown(),
                                            doc.fontSize(10),
                                            doc.text(`Next Remarks: ${pp.next_remarks}`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            );
                                        }
                                        else{
                                            return doc.fontSize(10),
                                            doc.moveDown(),
                                            doc.text(`Capability ${index + 1} ${pp.name}`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            ),
                                            doc.fontSize(10),
                                            doc.text(`Current Remarks: ${pp.current_remarks}`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            ),
                                            doc.moveDown(),
                                            doc.fontSize(10),
                                            doc.text(`Next Remarks: No Remarks`, {
                                                width: 500,
                                                align: 'center'
                                            }
                                            );
                                        }
                                    })

                            })

                        })

                        // done!
                        doc.end();
                        Assessments.findByIdAndUpdate(req.body.assessid, { pdffile: ramu + '.pdf' }, { new: true }, (err, pdf) => {
                            if (err) {
                                return res.json({ message: "Failed", err })
                            }
                            else {
                                return res.json({ message: "Successfully Generated" })
                            }
                        })

                    }
                })

        }
    })
})

router.post('/emailpdf', (req, res) => {
    assessid = req.body.assessid
    useremail = req.body.useremail
    Assessments.findById(req.body.assessid, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            // console.log("pdf name",doc.pdffile)
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL || 'techfinderusa@gmail.com',// TODO: your gmail account 
                    pass: process.env.PASSWORD || 'pgktvzarevqqmyiq' // TODO: your gmail password
                }
            });

            // Step 2
            let mailOptions = {
                from: 'techfinderusa@gmail.com', // TODO: email sender
                to: useremail, // TODO: email receiver
                subject: 'Nodemailer - Test',
                text: 'Wooohooo it works!!',
                attachments: [
                    { filename: doc.pdffile, path: __dirname + '/../../assessmentfiles/' + doc.pdffile.toString() } // TODO: replace it with your own image
                ]
            };


            // Step 3
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    return console.log('Error occurs');
                }
                return res.json({ message: 'Email sent!!!' });
            });
        }
    })
})

router.post('/viewassessmentbyuseridandassessid', (req, res) => {

    Assessments.findOne({ _id: req.body.assessid, userid: req.body.userid }, (err, docccc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            let questions=[]
            docccc.selecteddimensions.map(a=>{
                Questions.find({dimensionid:a,enabled:true}).populate('dimensionid',"name").exec((err,doccc)=>{
                    if(err){return res.json({messgae:"Failed",err})}
                    else{
                        doccc.map(b=>{
                            questions.push({_id:b._id,dimensionid:b.dimensionid,strand:b.strand,text:b.text})
                        })

                    }
                })
            }),setTimeout(() => {
                return res.json({message:"Success",docccc,questions})
            }, 2000);
            
        }
    })
})
module.exports = router