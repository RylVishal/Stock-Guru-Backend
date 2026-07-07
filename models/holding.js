const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    symbol:{
        type:String,
        required:true
    },

    companyName:{
        type:String,
        required:true
    },

    quantity:{
        type:Number,
        required:true
    },

    avgPrice:{
        type:Number,
        required:true
    }
},{
    timestamps:true
});
holdingSchema.index(
    {
        userId:1,
        symbol:1
    },
    {
        unique:true
    }
);
module.exports = mongoose.model(
    "Holding",
    holdingSchema
);


