const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true,
        unique:true
    },

    fullName:{
        type:String,
        required:true
    },

    panNumber:{
        type:String,
        required:true,
        uppercase:true
    },

    aadhaarNumber:{
        type:String,
        required:true
    },

    address:{
        type:String,
        required:true
    },

    dob:{
        type:Date,
        required:true
    },

    status:{
        type:String,
        enum:[
            "pending",
            "approved",
            "rejected"
        ],
        default:"pending"
    }

},{
    timestamps:true
});

module.exports =
mongoose.model(
    "KYC",
    kycSchema
);