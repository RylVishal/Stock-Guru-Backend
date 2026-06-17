const buyStockService = async(userId,data)=>{
    return {
        success:true,
        message:"Buy stock service working"
    };
};

const sellStockService = async(userId,data)=>{
    return {
        success:true,
        message:"Sell stock service working"
    };
};

const getHoldingsService = async(userId)=>{
    return {
        success:true,
        holdings:[]
    };
};

const getHistoryService = async(userId)=>{
    return {
        success:true,
        history:[]
    };
};

const getSummaryService = async(userId)=>{
    return {
        success:true,
        summary:{}
    };
};

module.exports = {
    buyStockService,
    sellStockService,
    getHoldingsService,
    getHistoryService,
    getSummaryService
};