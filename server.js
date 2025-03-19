const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fsp = require('fs/promises')

app.get('/', (req, res) => {
  res.send('Hello World!')
}).post('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'templates/index.html'))
}).post('/sinup',(req,res)=>{
    res.sendFile(path.join(__dirname,'templates/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})