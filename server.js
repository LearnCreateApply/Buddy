const express = require('express')
const app = express()
const port = 3000
const path = require('path')
app.get('/',(req,res)=>{
  res.send('Hello World')
})
app.get('/login',(req,res)=>{
  res.sendFile(path.join(__dirname,"templates/login.html"),()=>{})
})
app.get('/signup',(req,res)=>{
  res.sendFile(path.join(__dirname,"templates/signup.html"),()=>{})
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})






































// const fsp = require('fs/promises')
// app.use(express.json());
// app.use(express.static('public'))
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// }).post('/login',(req,res)=>{
//     res.sendFile(path.join(__dirname,'templates/login.html'))
// }).post('/signup',(req,res)=>{
//     res.sendFile(path.join(__dirname,'templates/signup.html'))
// })
