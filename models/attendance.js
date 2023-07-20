const mongoose = require('mongoose')

const attendance = mongoose.Schema({
    name :{
        type: String,
        required : true
    },
    id : {
        type: String,
        required : true
    },
    password:{
        type: String,
        required : true
    },
    dateArray : {
        type : Array,
        required : true
    },
    attendanceArray : {
        type : Array,
        required : true
    },
    total_present : {
        type: Number
    }
},{collection : "attendance"})

module.exports = mongoose.model('attedance',attendance)