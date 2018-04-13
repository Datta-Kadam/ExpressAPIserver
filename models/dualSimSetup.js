"use strict";
const mongoose =require('mongoose');
const Schema=mongoose.Schema;

//define projects schema
const dualSimSetupSchema=new Schema({
    release:String,
    projectName:String,
    apiList:[String],
    api:[
        {
            request: String,
            response:String
        }
    ]
});

//create the model class
const DualSimSetup=mongoose.model('Projects',dualSimSetupSchema);
//export the model
module.exports=DualSimSetup;
