const Portfolio = require("../models/portfolio");
const Holding = require("../models/holding");
const Transaction = require("../models/transaction");
const {
    getCompanyDetails,
    getLivePrice
} = require("./marketService");
    const buyStockService = async(userId,data)=>{
    const {searchId,quantity} = data;
    const portfolio = await Portfolio.findOne({userId});

    if(!portfolio){
    throw new Error("Portfolio not found");
    }   
    if(!searchId){
        throw new Error("searchId is required");
    }

    if(!quantity || quantity <= 0){
        throw new Error("Invalid quantity");
    }
    const companyData = await getCompanyDetails(searchId);
    const symbol = companyData.header.nseScriptCode;
    const companyName = companyData.header.displayName;
    const currentPrice = await getLivePrice(symbol);
    const totalCost = currentPrice * quantity;
    if(portfolio.cashBalance < totalCost){
    throw new Error("Insufficient Funds");
    }
    let holding = await Holding.findOne({userId,symbol});
    if(holding){

    const totalQuantity =
        holding.quantity + quantity;

    const avgPrice =
        (
            holding.quantity * holding.avgPrice +
            quantity * currentPrice
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
        avgPrice: currentPrice
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
    price:currentPrice,
    amount:totalCost
});
    return{
    success:true,
    message:"Stock Purchased Successfully",
    data:{
        symbol,
        companyName,
        quantity,
        price:currentPrice,
        totalCost
    }
};
};

const sellStockService = async(userId,data)=>{

    const { symbol, quantity } = data;

    if(!symbol){
        throw new Error("Symbol is required");
    }

    if(!quantity || quantity <= 0){
        throw new Error("Invalid quantity");
    }

    const portfolio =
        await Portfolio.findOne({ userId });

    if(!portfolio){
        throw new Error("Portfolio not found");
    }

    const holding =
        await Holding.findOne({
            userId,
            symbol
        });

    if(!holding){
        throw new Error(
            "You don't own this stock"
        );
    }

    if(quantity > holding.quantity){
        throw new Error(
            "Insufficient shares"
        );
    }

    const currentPrice =
        await getLivePrice(symbol);

    const saleAmount =
        currentPrice * quantity;

    const pnl =
        (currentPrice - holding.avgPrice)
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
        price: currentPrice,
        amount: saleAmount
    });

    return {
        success:true,
        message:"Stock sold successfully",
        data:{
            symbol,
            quantity,
            sellPrice: currentPrice,
            saleAmount,
            pnl
        }
    };
};
const getHoldingsService = async(userId)=>{

    const holdings = await Holding.find({
        userId
    });

    return {
        success:true,
        holdings
    };
};

const getHistoryService = async(userId)=>{

    const history = await Transaction.find({
        userId
    }).sort({
        createdAt:-1
    });

    return {
        success:true,
        history
    };
};

const getSummaryService = async(userId)=>{

    const portfolio = await Portfolio.findOne({
        userId
    });

    const holdingsCount =
        await Holding.countDocuments({
            userId
        });

    return {
        success:true,
        summary:{
            cashBalance:portfolio.cashBalance,
            totalInvested:portfolio.totalInvested,
            totalProfitLoss:portfolio.totalProfitLoss,
            holdingsCount
        }
    };
};
const round = (num) =>Number(num.toFixed(2));
const getAnalyticsService = async(userId)=>{

    const portfolio = await Portfolio.findOne({
        userId
    });

    if(!portfolio){
        throw new Error(
            "Portfolio not found"
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
        success:true,

        analytics:{
            portfolioValue,
            investedValue,
            unrealizedPnL,
            returnPercentage,
            cashBalance:
                portfolio.cashBalance,
            totalAccountValue
        },

        topWinner,
        topLoser,

        holdings:
            holdingAnalytics
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