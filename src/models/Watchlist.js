const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    symbol:{
        type:String,
        required:true
    },

    companyName:{
        type:String,
        required:true
    },

    searchId:{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
);

module.exports =
mongoose.model(
    "Watchlist",
    watchlistSchema
);