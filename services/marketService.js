const growwClient = require("./growwClient");
const redisClient = require("../config/redis");
const CHART_CONFIG = {
    "1D": {
        path: "daily",
        params: {
            intervalInMinutes: 1
        }
    },

    "1W": {
        path: "weekly",
        params: {
            intervalInMinutes: 5
        }
    },

    "1M": {
        path: "monthly/v2",
        params: {
            months: 1
        }
    },

    "3M": {
        path: "monthly/v2",
        params: {
            months: 3
        }
    },

    "6M": {
        path: "monthly/v2",
        params: {
            months: 6
        }
    },

    "1Y": {
        path: "1y",
        params: {
            intervalInDays: 1
        }
    },

    "3Y": {
        path: "3y",
        params: {
            intervalInDays: 3
        }
    },

    "5Y": {
        path: "5y",
        params: {
            intervalInDays: 5
        }
    },

    "ALL": {
        path: "all",
        params: {
            noOfCandles: 300
        }
    }
};


const getMostBoughtStocks = async () => {
   const cachedKey = `market:most-bought`;
   const cached = await redisClient.get(cachedKey);
    if(cached){
       console.log("cache hit!");
       return JSON.parse(cached);
     }
    console.log("cache missed!");
    const response = await growwClient.get(
        "/v1/api/stocks_data/v2/explore/list/top",
        {
            params: {
                discoveryFilterTypes:
                "POPULAR_STOCKS_MOST_BOUGHT",
                page: 0,
                size: 20
            }
        }
    );

   await redisClient.set(
    cachedKey,
    JSON.stringify(response.data),
    {
        EX:15
    }
   );

    return response.data;
};

const getTopMovers = async(type)=>{
 
    const cachedKey = `market:top-movers:${type}`;    const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache missed!"); 
    const response = await growwClient.get(
        "/bff/web/stocks/explore/web-pages/top_movers",
        {
            params:{
                indice:"GIDXNIFTY100",
                moverType:type,
                pageSize:20
            }
        }
    );

    await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );

    return response.data;
};

const getTrendingSectors = async()=>{
    
    const cachedKey = `market:trending-sectors`;
    const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache miss!");
    const response = await growwClient.get(
        "/bff/web/stocks/explore/web-pages/trending_sectors",
        {
            params:{
                pageSize:20
            }
        }
    );

    await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );

    return response.data;
};

const getNews = async()=>{
    const cachedKey = `market:news`;
    const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit");
        return JSON.parse(cached);
    }
    console.log("cache missed!");

    const response = await growwClient.get(
        "/v2/api/feed/public",
        {
            params:{
                publisherId:"stocknewssummary",
                page:0,
                size:20
            }
        }
    );
    await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );

    return response.data;
};

const getCompanyDetails = async(searchId)=>{
   const cachedKey = `market:stock:${searchId}`
   const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache missed!");
   const response = await growwClient.get(
    `/v1/api/stocks_data/v1/company/search_id/${searchId}`,
    {
        params:{
            page:0,
            size:1
        }
    }
   );
    await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );

   return response.data
}
const getLivePrice = async(symbol)=>{
    const cachedKey = `market:price:${symbol}`;
    const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache missed!");
    const response = await growwClient.get(
        `/v1/api/stocks_data/v1/tr_live_book/exchange/NSE/segment/CASH/${symbol}/latest`
    );

    const data = response.data;

    const livePrice =
    (
        data.buyBook["1"].price +
        data.sellBook["1"].price
    ) / 2;
     await redisClient.set(
        cachedKey,
        JSON.stringify(livePrice),
        {
            EX:15
        }
    );


    return livePrice;
};

const searchStocks = async(query)=>{
  const cachedKey = `market:search:${query}`;
  const cached = await redisClient.get(cachedKey);
    if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache missed!");
    const response = await growwClient.get(
        "/v1/api/search/v3/query/global/st_p_query",
        {
            params:{
                page:0,
                query,
                size:10,
                web:true
            }
        }
    );
     await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );


    return response.data;
};
const getChartData = async (
    symbol,
    range = "1D",
    type = "line"
) => {
        const cachedKey = `market:chart:${symbol}:${range}:${type}`;
        const cached = await redisClient.get(cachedKey);
        if(cached){
        console.log("cache hit!");
        return JSON.parse(cached);
    }
    console.log("cache missed!");
    const config = CHART_CONFIG[range.toUpperCase()];

    if (!config) {
        throw new Error("Invalid chart range");
    }

    const params = {
        ...config.params
    };

    // Only send minimal=true for line charts
    if (type === "line") {
        params.minimal = true;
    }

    const response = await growwClient.get(
        `/v1/api/charting_service/v2/chart/delayed/exchange/NSE/segment/CASH/${symbol}/${config.path}`,
        {
            params
        }
    );
    await redisClient.set(
        cachedKey,
        JSON.stringify(response.data),
        {
            EX:15
        }
    );

    return response.data;
};
module.exports = {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews,
    getCompanyDetails,
    getLivePrice,
    searchStocks,
    getChartData
};
