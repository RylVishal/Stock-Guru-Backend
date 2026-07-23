const Holding = require('../models/holding');
const Watchlist = require('../models/Watchlist');
const {getFreshLivePrice} = require("../services/marketService");
const redisClient = require("../config/redis");
const sleep = require("../utils/sleep");
const { getIO } = require("../sockets/socket");
const POLLING_INTERVAL = 2000;
let c=0;
const isMarketOpen = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const day = istTime.getUTCDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false;

    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const timeInMins = hours * 60 + minutes;

    // Market hours: 9:15 AM (555 mins) to 3:30 PM (930 mins) IST
    return timeInMins >= 555 && timeInMins <= 930;
};

const startMarketWorker = async ()=>{
    console.log("Market worker started");
    while(true){
        try{
          if (!isMarketOpen()) {
            // Market is closed — sleep 30 seconds to conserve API & server resources
            await sleep(30000);
            continue;
          }

          const symbols = await redisClient.sMembers(
         "trackedSymbols"
         );
          const uniqueSymbols = [...new Set(symbols)];
          if(uniqueSymbols.length === 0){
            await sleep(POLLING_INTERVAL);
            continue;
          }
          await Promise.allSettled(
            uniqueSymbols.map(async(symbol)=>{
                const livePrice = await getFreshLivePrice(symbol);
                await redisClient.set(
                    `market:price:${symbol}`,
                    JSON.stringify(livePrice),
                    {
                        EX:15
                    }
                );
                const io = getIO();
                if (io) {
                  io.to(symbol).emit("price:update", {
                    symbol,
                    price: livePrice
                  });
                }
            })
          );
        }
        catch(err){
            console.error("Error in market worker:", err);
        }
        await sleep(POLLING_INTERVAL);
    }
};

module.exports = startMarketWorker;