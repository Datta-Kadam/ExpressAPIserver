"use strict";
const mongoose =require('mongoose');
const Schema=mongoose.Schema;

//define projects schema
const projectSchema=new Schema({    
    projectName:String,
    apiName:String,
    request:String,
    response:String,
    userId:String
});

//create the model class
const Project=mongoose.model('1707_project1',projectSchema);
//export the model
module.exports=Project;