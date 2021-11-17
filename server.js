const express=require('express')
const mongoose=require('mongoose')
// const url='mongodb://iabfomassessmentpomgvz:mOjgqPr0vCn0pQmnwX8@209.145.51.153:25173/assessmentdb'
const url='mongodb://hsaudassessment:hfdv54t4wesvSDFha@178.18.244.82:24812/assessmentdb'
//178.18.244.82:24812
// const url='mongodb://localhost/Assessment'
const bodyParser=require('body-parser')
const dimensionsroute=require('./routes/Dimensions')
const strandsroute=require('./routes/Strands')
const capabilitiesroute=require('./routes/Capability')
const questionsroute=require('./routes/Questions')
const answersroute=require('./routes/Answers')
const userroute=require('./routes/Users')
const assessmentroute=require('./routes/Assessments')
const cors=require('cors')
const app=express()

app.use(bodyParser.json())
app.use(cors())

app.use('/dimension',dimensionsroute)
app.use('/strand',strandsroute)
app.use('/capability',capabilitiesroute)
app.use('/question',questionsroute)
app.use('/answer',answersroute)
app.use('/user',userroute)
app.use('/assessment',assessmentroute)
app.use('/',require('./routes/output'))

app.get('/',(req,res)=>{
    res.send('<h1>heloo owais</h1>')
})
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true})
const db=mongoose.connection;
db.once('open',()=>{
    console.log('connected to mongodb')
})
const PORT=process.env.PORT || 4003
app.listen(PORT,()=>{console.log(`Server started at port ${PORT}`)})