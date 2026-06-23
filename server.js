const env = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

const start = async ()=>{
    await connectDB();
    app.listen(env.PORT,()=>{
        console.log("Server is connected!");
    });
};
start();
