const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({
    title : String,
    salary : Number,
    language : String
})

const login = new mongoose.model('login',loginSchema)
module.exports = login