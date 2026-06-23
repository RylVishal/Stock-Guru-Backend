const {
    buyStockService,
    sellStockService,
    getHoldingsService,
    getHistoryService,
    getSummaryService,
    getAnalyticsService
} = require("../services/portfolioService");

const buyStock = async(req,res,next)=>{
    try{

        const result =
            await buyStockService(
                req.user.id,
                req.body
            );

        res.status(200).json(result);

    }catch(err){
        next(err);
    }
};

const sellStock = async (req,res,next)=>{
    try{
        const result = await sellStockService(
            req.user.id,
            req.body
        );
        res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
};

const getHoldings = async (req,res,next)=>{
    try{
    const result = await getHoldingsService(
        req.user.id
    );
    res.status(200).json(result);
}
   catch(err){
    next(err);
   }
}
const getHistory = async (req,res,next)=>{
    try{
    const result = await getHistoryService(
        req.user.id
    );
    res.status(200).json(result);
}
   catch(err){
    next(err);
   }
}

const getSummary = async (req,res,next)=>{
    try{
    const result = await getSummaryService(
        req.user.id
    );
    res.status(200).json(result);
}
   catch(err){
    next(err);
   }
}
const getAnalytics = async(
    req,
    res,
    next
)=>{
    try{

        const result =
            await getAnalyticsService(
                req.user.id
            );

        res.status(200)
           .json(result);

    }catch(err){
        next(err);
    }
};

module.exports = {
    buyStock,
    sellStock,
    getHoldings,
    getHistory,
    getSummary,
    getAnalytics
};