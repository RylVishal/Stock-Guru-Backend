const growwClient = require("./growwClient");
const getMostBoughtStocks = async () => {

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

    return response.data;
};

const getTopMovers = async(type)=>{

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

    return response.data;
};

const getTrendingSectors = async()=>{

    const response = await growwClient.get(
        "/bff/web/stocks/explore/web-pages/trending_sectors",
        {
            params:{
                pageSize:20
            }
        }
    );

    return response.data;
};

const getNews = async()=>{

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

    return response.data;
};

const getCompanyDetails = async(searchId)=>{
   const response = await growwClient.get(
    `/v1/api/stocks_data/v1/company/search_id/${searchId}`,
    {
        params:{
            page:0,
            size:1
        }
    }
   );
   return response.data
}
const getLivePrice = async(symbol)=>{
    const response = await growwClient.get(
        `/v1/api/stocks_data/v1/tr_live_book/exchange/NSE/segment/CASH/${symbol}/latest`
    );

    const data = response.data;

    const livePrice =
    (
        data.buyBook["1"].price +
        data.sellBook["1"].price
    ) / 2;

    return livePrice;
};

const searchStocks = async(query)=>{
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

    return response.data;
};
const getChartData = async(symbol) => {
    const response = await growwClient.get(
        `/v1/api/charting_service/v2/chart/delayed/exchange/NSE/segment/CASH/${symbol}/daily`,
        {
            params: {
                intervalInMinutes: 1,
                minimal: true
            }
        }
    );

    return response.data;
};

const getCandles = async(symbol) => {

    const response = await growwClient.get(
        `/v1/api/charting_service/v2/chart/delayed/exchange/NSE/segment/CASH/${symbol}/daily`,
        {
            params: {
                intervalInMinutes: 1
            }
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
    getChartData,
    getCandles
};