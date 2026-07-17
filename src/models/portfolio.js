const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    cashBalance:{
        type:Number,
        default:100000
    },

    totalInvested:{
        type:Number,
        default:0
    },

    totalProfitLoss:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

module.exports = mongoose.model(
    "Portfolio",
    portfolioSchema
);