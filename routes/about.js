const express = require('express')
const router = express.Router()

router.get('/',(req,res)=>{
    res.send('Work')
})
router.get('/me',(req,res)=>{
    res.send('Work baby')
})

module.exports = router