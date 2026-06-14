
const mongoose = require("mongoose");


const user = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:50
    },
        email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match:[
            /^\S+@\S+\.\S+$/,
            "Invalid email"
        ]
    },

    password:{
        type:String,
        required:true,
        minlength:8
    },

    role:{
        type:String,
        enum:[
            "user",
            "admin"
        ],
        default:"user"
    },

    kycVerified:{
        type:Boolean,
        default:false
    },

    refreshToken:{
        type:String,
        default:null
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Users",user);