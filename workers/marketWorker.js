const Holding = require('../models/holding');
const Watchlist = require('../models/Watchlist');
const {getLivePrice} = require("../services/marketService");
const redisClient = require("../config/redis");
const sleep = require("../utils/sleep");
const { getIO } = require("../sockets/socket");
const POLLING_INTERVAL = 2000;
let c=0;
const startMarketWorker = async ()=>{
    console.log("Market worker started");
    while(true){
        try{
          const symbols = await redisClient.sMembers(
         "trackedSymbols"
         );
          const uniqueSymbols = [...new Set(symbols)];
          console.log("Unique symbols to fetch live price:", uniqueSymbols);
          if(uniqueSymbols.length === 0){
            console.log("No tracked symbols found!");
            await sleep(POLLING_INTERVAL);
            continue;
          }
          console.log(`Refreshing ${uniqueSymbols.length} symbols...`);
          await Promise.allSettled(
            uniqueSymbols.map(async(symbol)=>{
                const livePrice = await getLivePrice(symbol);
                await redisClient.set(
                    `market:price:${symbol}`,
                    JSON.stringify(livePrice),
                    {
                        EX:15
                    }

                );
                const io = getIO();
           
            io.to(symbol).emit("price:update", {
            symbol,
            price: livePrice
           });
            
        })
        );
          console.log("Market cache updated",c);
          c++;
        }
        catch(err){
            console.error("Error in market worker:", err);
        }
        await sleep(POLLING_INTERVAL);
    }
};

module.exports = startMarketWorker;