const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const { Auth, LoginCredentials } = require('two-step-auth')
const Otp = require('../models/Otp')
const checkauthorization = require('../checkauthorization')
const Users = require('../models/User');
const fs = require('fs');



//get all user
router.get('/viewusers', (req, res) => {
    Users.find((err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Success", doc })
        }
    })
})



//user signup
router.post('/createuser', async (req, res) => {
console.log(req.body)
    // let otpno = Math.floor(100000 + Math.random() * 900000)
    // console.log(otpno)

    // let otp = {
    //     phnumber: req.body.phnumber,
    //     otpcode: otpno
    // }
    const saltrounds = 10;
    const originalpassword = req.body.password;
    const hashpassword = await bcrypt.hash(originalpassword, saltrounds);
    // let data
    // if(req.body.phnumber){
     let data = {
        email: req.body.email,
        name: req.body.name,
        phnumber: req.body.phnumber,
        password: hashpassword,
        address: req.body.address,
        city: req.body.city
    }
    //}
    // else{
    //      data = {
    //         email: req.body.email,
    //         name: req.body.name,
    //         password: hashpassword,
    //         address: req.body.address,
    //         city: req.body.city
    //     }
    // }
    console.log(data)
    const ismatch = await bcrypt.compare(originalpassword, hashpassword)
    console.log(ismatch)

    console.log(hashpassword)
    // Otp.create(otp, (err, doc) => {
    //     if (err) {
    //         return res.json({ message: "Failed", err })
    //     }
    //     else {
            Users.create(data, (err, docc) => {
                if (err) {
                    return res.json({ message: "Failed", err })
                }
                else {
                    Users.findOneAndUpdate({email:docc.email},{islogged:true},{new:true},(err,createduser)=>{
                        if(err){
                            return res.json({message:"Failed",err})
                        }
                        else{
                            return res.json({ message: "Successfull", createduser})
                        }
                    })
                    
                }
            })
    //     }
    // })
})

//Delete User
router.delete('/deleteuser', (req, res) => {
    const id = req.body.id;
    Users.findByIdAndDelete(id, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "User Deleted", doc })
        }
    })

})

//View otp
router.get('/viewotpcodes', (req, res) => {
    Otp.find((err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Success", doc })
        }
    })
})

//Verify otp and update users array
router.put('/verify', (req, res) => {
    console.log('body->', req.body)
    if (req.body.phnumber !== undefined && req.body.otpnumber !== undefined) {
        Otp.findOne({ phnumber: req.body.phnumber, otpcode: req.body.otpnumber }, (err, doc) => {
            if (err) return res.json({ message: "Failed", err })
            else {
                if (doc !== null) {
                    // const updatespecific= User.updateOne({email:req.body.email},{$set:{Authorize:{$eq:true}}})
                    //res.json(updatespecific)
                    Users.findOneAndUpdate({ phnumber: req.body.phnumber }, { Authorize: true }, { new: true }, (error, user) => {
                        if (error) return res.json({ message: "Failed", error })
                        else {
                            return res.json({ messageL: "success", otp: doc, user: user })
                        }
                    })
                }
                else {
                    return res.json("Invalid OTP or email")
                }
            }
        })
    }
    else {
        return res.json({ message: "Failed", Error: "OTP and Email are required" })
    }
})



//login route
router.get('/login', checkauthorization, (req, res) => {
    const id = req.body.id;
    console.log('user login')

})

router.get('/viewmyprofile', (req, res) => {
    Users.findOne({ _id: req.body.id }, (err, data) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Success", data })
        }
    })
})

router.put('/changepassword', (req, res) => {
    Users.findOne({ _id: req.body.id, password: { $eq: req.body.oldpassword } }, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed" })
        }
        else {
            if (doc !== null) {
                Users.findOneAndUpdate({ _id: req.body.id }, { password: req.body.newpassword }, { new: true }, (err, doc) => {
                    if (err) {
                        return res.json({ message: "Failed", err })
                    }
                    else {
                        let notificationn = {
                            userid: req.body.id,
                            notification: "Password Changed"
                        }
                        Notifications.create(notificationn, (err, not) => {
                            if (err) {
                                return res.json({ message: "Failed", err })
                            }
                            else {
                                return res.json({ message: "Password Changed", doc })
                            }
                        })

                    }
                })
            }
            else {
                return res.json({ message: "this is not your old password" })
            }
        }
    })

})

//Delete Otps
router.delete('/deleteallotps', (req, res) => {
    let id = req.body.id
    Otp.findByIdAndDelete(id, (err, doc) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            return res.json({ message: "Otp deleted", doc })
        }
    })

})

router.post('/loginwithnameemailpassword', (req, res) => {
    reqpass = req.body.pass

    let data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    Users.findOne({ email: data.email }, (err, user) => {
        if (err) {
            return res.json({ message: "Failed", err })
        }
        else {
            if (!user) {
                return res.json({ message: "Invalid email" })
            }
            else {
                bcrypt.compare(data.password, user.password, (err, userr) => {
                    if (err) {
                        return res.json({ message: "Failed", err })
                    }
                    else {
                        if (!userr) {
                            return res.json({ message: "Invalid password" })
                        }
                        else {
                            Users.findOneAndUpdate({ email: data.email }, { islogged: true }, { new: true }, (err, loggeduser) => {
                                if (err) {
                                    return res.json({ message: "Failed", err })
                                }
                                else {
                                    return res.json({ message: "Success", loggeduser })
                                }
                            })

                        }
                    }
                })
            }
            
        }
    })
})

router.post('/userlogout',(req,res)=>{
    Users.findOneAndUpdate({email:req.body.email},{islogged:false},{new:true},(err,loggedoutuser)=>{
    if(err){
        return res.json({message:"Failed",err})
    }
    else{
        return res.json({message:"Successfully logged out",loggedoutuser})
    }
})
})

router.delete('/deleteusers',(req,res)=>{
    Users.deleteMany({},(err,doc)=>{
        if(err){
            return res.json({message:"Failed",err})
        }
        else{
        return res.json({message:"Users Deleted"})
        }
    })
})
module.exports = router;