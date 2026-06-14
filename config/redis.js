const {createClient} = require("redis");
const env = require("./env");

const redisClient = createClient({
    url:env.REDIS_URL
});

redisClient.on("error",(err)=>{
    console.log("Redis Error: ",err);
});

(async ()=>{
    await redisClient.connect();
    console.log("Redis connected Successfully!");
})();

module.exports = redisClient;