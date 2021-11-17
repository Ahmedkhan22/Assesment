const Users=require('./models/User')
const checkauthorization=(req,res,next)=>{
    if(req.body.id!==undefined)
    {
        Users.findOne({_id:req.body.id,Authorize:true},(err,doc)=>{
            if(err) return res.json({message:"Failed",err})
            else
            {
                if(doc!==null)
                {
                   // const updatespecific= User.updateOne({email:req.body.email},{$set:{Authorize:{$eq:true}}})
                    //res.json(updatespecific)
                    Users.findOneAndUpdate({_id:req.body.id},{Authorize:true},{new:true},(error,data)=>{
                        if(error)return res.json({message:"Failed",error})
                        else{
                            return res.json({messageL:"User Login",user:data})
                        }
                    })
                }
                else
                {
                    return res.json("Not authorized")
                }
            }})}}
module.exports=checkauthorization