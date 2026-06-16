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

module.exports = {
    getMostBoughtStocks,
    getTopMovers,
    getTrendingSectors,
    getNews
};