const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{ type:String , unique : true, required : true, dropDups: true },
    password:{ type:String , required : true, dropDups: true },
    email:{ type:String},
    created:{type:Array},
    joined:{type:Array}
})

const classSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    createdBy:{type:String},
    joinCode:{type:Number,unique : true, required : true, dropDups: true},
    members:{type:Array},
    tasks:{type:Array}
})

const User = mongoose.model('user',userSchema)
const Class = mongoose.model('class',classSchema)

module.exports={User,Class}