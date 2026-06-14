const env = require("./env");
const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(env.MONGO_URI);
        console.log("connected to mongoose");
    }
    catch(err){
        console.log("connection to db failed!: ",err);
        process.exit(1);
    }
}

module.exports = connectDB;