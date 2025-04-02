const express = require('express')
const mongoose = require('mongoose')
const path  = require('path')
const { title } = require('process')
const login = require(path.join(__dirname,'models/login.js'))
const app = express()
const con = mongoose.connect('mongodb+srv://shivamingulkar1234:mkzs9674@timepasss.x95cr2x.mongodb.net/data')
const port = 3000
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'/templates/index.html'))
})
app.get('/submit',async (req,res)=>{
  await login.deleteMany({}).then(()=>{console.log('delete');
  })
  for (let i = 0; i < 10; i++) {
    const data = new login({title:'Shivam',salary:'1300',language:'node.js'})
    data.save()
  }
  res.send('Data Generated')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})