const {
    buyStockService,
    sellStockService,
    getHoldingsService,
    getHistoryService,
    getSummaryService
} = require("../services/portfolioService");

const buyStock = async(req,res,next)=>{
    try{
        const result = await buyStockService(
            req.user.id,
            req.body
        );
        res.status(200).json(result);
    }
    catch(err){
        next(err);
    }
}

const sellStock = async (req,res,next)=>{
    try{
        const result = await sellStockService(
            req.user.id,
            req.user
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

module.exports = {
    buyStock,
    sellStock,
    getHoldings,
    getHistory,
    getSummary
};