const Portfolio = require("../models/portfolio");
const Holding = require("../models/holding");
const Transaction = require("../models/transaction");
const {
    getCompanyDetails,
    getLivePrice
} = require("./marketService");
const redisClient = require("../config/redis");
const AppError = require("../utils/AppError");
    const buyStockService = async(userId,data)=>{
    const {searchId,quantity} = data;
    const portfolio = await Portfolio.findOne({userId});
    console.log("SearchId:",searchId);
    console.log("Quantity: ",quantity);
    if(!portfolio){
    throw new AppError("Portfolio not found",404);
    }   
    if(!searchId){
        
        throw new AppError("searchId is required",400);
    }

    if(!quantity || quantity <= 0){
        throw new AppError("Invalid quantity",400);
    }
    const companyData = await getCompanyDetails(searchId);
    const symbol = companyData.header.nseScriptCode;
    const companyName = companyData.header.displayName;
    const currentPrice = await getLivePrice(symbol);
    const roundedPrice = Number.isFinite(currentPrice)
        ? Math.round(currentPrice * 100) / 100
        : 0;
    const totalCost = roundedPrice * quantity;
    if(portfolio.cashBalance < totalCost){
    throw new AppError("Insufficient Funds",400);
    }   
    let holding = await Holding.findOne({userId,symbol});
    if(holding){

    const totalQuantity =
        holding.quantity + quantity;

    const avgPrice =
        (
            holding.quantity * holding.avgPrice +
            quantity * roundedPrice
        ) / totalQuantity;

    holding.quantity = totalQuantity;
    holding.avgPrice = avgPrice;

    await holding.save();
}   
    else{

    holding = await Holding.create({
        userId,
        symbol,
        companyName,
        quantity,
        avgPrice: roundedPrice
    });
}
    portfolio.cashBalance -= totalCost;
    portfolio.totalInvested += totalCost;
    await portfolio.save();
    await Transaction.create({
    userId,
    symbol,
    companyName,
    type:"BUY",
    quantity,
    price: roundedPrice,
    amount:totalCost
});
    await redisClient.sAdd(
    "trackedSymbols",
    symbol
);
    return {
    symbol,
    companyName,
    quantity,
    price: roundedPrice,
    totalCost
};};

const sellStockService = async(userId,data)=>{

    const { symbol, quantity } = data;

    if(!symbol){
        throw new AppError("Symbol is required",400);
    }

    if(!quantity || quantity <= 0){
        throw new AppError("Invalid quantity",400);
    }

    const portfolio =
        await Portfolio.findOne({ userId });

    if(!portfolio){
        throw new AppError("Portfolio not found",404);
    }

    const holding =
        await Holding.findOne({
            userId,
            symbol
        });

    if(!holding){
        throw new AppError(
            "You don't own this stock",
            409
        );
    }

    if(quantity > holding.quantity){
        throw new Error(
            "Insufficient shares",
            400
        );
    }

    const currentPrice =
        await getLivePrice(symbol);

    const roundedPrice = Number.isFinite(currentPrice)
        ? Math.round(currentPrice * 100) / 100
        : 0;

    const saleAmount =
        roundedPrice * quantity;

    const pnl =
        (roundedPrice - holding.avgPrice)
        * quantity;

    portfolio.cashBalance += saleAmount;
    portfolio.totalProfitLoss += pnl;

    const remainingQty =
        holding.quantity - quantity;

    if(remainingQty === 0){

        await Holding.deleteOne({
            _id: holding._id
        });

    } else {

        holding.quantity = remainingQty;
        await holding.save();

    }

    await portfolio.save();

    await Transaction.create({
        userId,
        symbol,
        companyName: holding.companyName,
        type: "SELL",
        quantity,
        price: roundedPrice,
        amount: saleAmount
    });
    return {
    symbol,
    quantity,
    sellPrice: currentPrice,
    saleAmount,
    pnl
};
};
const getHoldingsService = async (userId) => {

    const holdings = await Holding.find({
        userId
    });

    const holdingsWithLivePrices = await Promise.all(
        holdings.map(async (holding) => {
            try {
                // Fetch current live price for each holding
                const currentPrice = await getLivePrice(holding.symbol);
                const quantity = Number(holding.quantity ?? 0);
                const avgPrice = Number(holding.avgPrice ?? 0);
                const investedValue = quantity * avgPrice;
                const currentValue = quantity * currentPrice;
                const pnl = currentValue - investedValue;
                const returnPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

                return {
                    id: holding._id.toString(),
                    symbol: holding.symbol,
                    companyName: holding.companyName,
                    quantity: quantity,
                    avgPrice: avgPrice,
                    currentPrice: currentPrice,
                    investedValue: investedValue,
                    currentValue: currentValue,
                    pnl: pnl,
                    returnPercent: returnPercent
                };
            } catch (error) {
                console.error(`Failed to fetch live price for ${holding.symbol}:`, error);
                // Return holding without live price if fetch fails
                return {
                    id: holding._id.toString(),
                    symbol: holding.symbol,
                    companyName: holding.companyName,
                    quantity: Number(holding.quantity ?? 0),
                    avgPrice: Number(holding.avgPrice ?? 0)
                };
            }
        })
    );

    return holdingsWithLivePrices;

};

const getHistoryService = async (userId) => {

    const history = await Transaction.find({
        userId
    }).sort({
        createdAt: -1
    });

    return history.map((transaction) => ({

        symbol: transaction.symbol,

        companyName: transaction.companyName,

        type: transaction.type,

        quantity: transaction.quantity,

        price: transaction.price,

        amount: transaction.amount,

        createdAt: transaction.createdAt.toISOString()

    }));

};
const getSummaryService = async(userId)=>{

    const portfolio = await Portfolio.findOne({
        userId
    });

    if(!portfolio){
        throw new AppError("Portfolio not found", 404);
    }

    const holdings = await Holding.find({
        userId
    });

    let activeInvestedValue = 0;
    let activeCurrentValue = 0;

    for (const holding of holdings) {
        try {
            const currentPrice = await getLivePrice(holding.symbol);
            const qty = Number(holding.quantity ?? 0);
            const avg = Number(holding.avgPrice ?? 0);
            activeInvestedValue += qty * avg;
            activeCurrentValue += qty * currentPrice;
        } catch (error) {
            console.error(`Failed to fetch price for ${holding.symbol} in summary service:`, error);
            const qty = Number(holding.quantity ?? 0);
            const avg = Number(holding.avgPrice ?? 0);
            activeInvestedValue += qty * avg;
            activeCurrentValue += qty * avg;
        }
    }

    const unrealizedPnL = activeCurrentValue - activeInvestedValue;

    return {
        cashBalance: portfolio.cashBalance,
        totalInvested: activeInvestedValue,
        totalProfitLoss: unrealizedPnL,
        holdingsCount: holdings.length
    };
};
const round = (num) =>Number(num.toFixed(2));
const getAnalyticsService = async(userId)=>{

    const portfolio = await Portfolio.findOne({
        userId
    });

    if(!portfolio){
        throw new AppError(
            "Portfolio not found",
            404
        );
    }

    const holdings = await Holding.find({
        userId
    });

    let investedValue = 0;
    let portfolioValue = 0;

    const holdingAnalytics = [];

    for(const holding of holdings){

        const currentPrice =
            await getLivePrice(
                holding.symbol
            );

        const holdingInvestedValue =
            holding.quantity *
            holding.avgPrice;

        const holdingCurrentValue =
            holding.quantity *
            currentPrice;

        const pnl =
            holdingCurrentValue -
            holdingInvestedValue;

        const returnPercent =
            holdingInvestedValue > 0
            ?
            (
                pnl /
                holdingInvestedValue
            ) * 100
            :
            0;

        investedValue +=
            holdingInvestedValue;

        portfolioValue +=
            holdingCurrentValue;

    holdingAnalytics.push({
    id: holding._id.toString(),
    symbol: holding.symbol,
    companyName: holding.companyName,
    quantity: holding.quantity,
    avgPrice: round(holding.avgPrice),
    currentPrice: round(currentPrice),
    investedValue: round(
        holdingInvestedValue
    ),
    currentValue: round(
        holdingCurrentValue
    ),
    pnl: round(pnl),
    returnPercent: round(
        returnPercent
    )
});
    }

    const unrealizedPnL =
        portfolioValue -
        investedValue;

    const returnPercentage =
        investedValue > 0
        ?
        (
            unrealizedPnL /
            investedValue
        ) * 100
        :
        0;

    const totalAccountValue =
        portfolio.cashBalance +
        portfolioValue;

    const sortedHoldings =
        [...holdingAnalytics]
        .sort(
            (a,b)=>
            b.pnl - a.pnl
        );

    const topWinner =
        sortedHoldings.length > 0
        ?
        sortedHoldings[0]
        :
        null;

    const topLoser =
        sortedHoldings.length > 0
        ?
        sortedHoldings[
            sortedHoldings.length - 1
        ]
        :
        null;

    return {
    analytics: {
        portfolioValue: round(portfolioValue),
        investedValue: round(investedValue),
        unrealizedPnL: round(unrealizedPnL),
        returnPercentage: round(returnPercentage),
        cashBalance: round(portfolio.cashBalance),
        totalAccountValue: round(totalAccountValue)
    },
    topWinner,
    topLoser,
    holdings: holdingAnalytics
};
};
module.exports = {
    buyStockService,
    sellStockService,
    getHoldingsService,
    getHistoryService,
    getSummaryService,
    getAnalyticsService
};