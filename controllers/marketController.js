const {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews
} = require("../services/marketService");

const mostBought = async(req,res,next)=>{
    try{
    const data = await getMostBoughtStocks();
    res.status(200).json(data);
    }
    catch(err){
        next(err);
    }
};
const topGainers = async(req,res,next)=>{
    try{
    const data = await getTopMovers("TOP_GAINERS");
    res.status(200).json(data);
    }
    catch(err){
        next(err);
    }
};

const topLosers = async(req,res,next)=>{
    try{

        const data =
        await getTopMovers(
            "TOP_LOSERS"
        );

        res.status(200).json(data);

    }catch(err){
        next(err);
    }
};

const trendingSectors = async(req,res,next)=>{
    try{
        const data = await getTrendingSectors();
        res.status(200).json(data);

    }
    catch(err){
        next(err);
    }
};

const news = async(req,res,next)=>{
   
    try{
        const data =await getNews();
        res.status(200).json(data);
    }
    catch(err){
         next(err);
    }
};

module.exports = {
    mostBought,
    topGainers,
    topLosers,
    trendingSectors,
    news
};