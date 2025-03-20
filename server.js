const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const about = require('./routes/about')
app.use('/about',about)
app.get('/',(req,res)=>{
  res.send('hello world')
})
app.get('/home',(req,res)=>{
  res.sendFile(path.join(__dirname,"public/index.html"))
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})