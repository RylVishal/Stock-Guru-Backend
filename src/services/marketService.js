const growwClient = require("./growwClient");
const redisClient = require("../config/redis");

const CHART_CONFIG = {
  "1D": {
    path: "daily",
    params: {
      intervalInMinutes: 1,
    },
  },

  "1W": {
    path: "weekly",
    params: {
      intervalInMinutes: 5,
    },
  },

  "1M": {
    path: "monthly/v2",
    params: {
      months: 1,
    },
  },

  "3M": {
    path: "monthly/v2",
    params: {
      months: 3,
    },
  },

  "6M": {
    path: "monthly/v2",
    params: {
      months: 6,
    },
  },

  "1Y": {
    path: "1y",
    params: {
      intervalInDays: 1,
    },
  },

  "3Y": {
    path: "3y",
    params: {
      intervalInDays: 3,
    },
  },

  "5Y": {
    path: "5y",
    params: {
      intervalInDays: 5,
    },
  },

  "ALL": {
    path: "all",
    params: {
      noOfCandles: 300,
    },
  },
};

const getMostBoughtStocks = async () => {
  const cachedKey = `market:most-bought`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const response = await growwClient.get(
    "/v1/api/stocks_data/v2/explore/list/top",
    {
      params: {
        discoveryFilterTypes: "POPULAR_STOCKS_MOST_BOUGHT",
        page: 0,
        size: 20,
      },
    }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getTopMovers = async (type) => {
  const cachedKey = `market:top-movers:${type}`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const response = await growwClient.get(
    "/bff/web/stocks/explore/web-pages/top_movers",
    {
      params: {
        indice: "GIDXNIFTY100",
        moverType: type,
        pageSize: 20,
      },
    }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getTrendingSectors = async () => {
  const cachedKey = `market:trending-sectors`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache miss!");
  const response = await growwClient.get(
    "/bff/web/stocks/explore/web-pages/trending_sectors",
    {
      params: {
        pageSize: 20,
      },
    }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getNews = async () => {
  const cachedKey = `market:news`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const response = await growwClient.get("/v2/api/feed/public", {
    params: {
      publisherId: "stocknewssummary",
      page: 0,
      size: 20,
    },
  });

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getCompanyDetails = async (searchId) => {
  const cachedKey = `market:stock:${searchId}`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const response = await growwClient.get(
    `/v1/api/stocks_data/v1/company/search_id/${searchId}`,
    {
      params: {
        page: 0,
        size: 1,
      },
    }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getChartData = async (symbol, range = "1D", type = "line") => {
  const cachedKey = `market:chart:${symbol}:${range}:${type}`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const config = CHART_CONFIG[range.toUpperCase()];
  if (!config) throw new Error("Invalid chart range");

  const params = {
    ...config.params,
  };

  if (type === "line") {
    params.minimal = true;
  }

  const response = await growwClient.get(
    `/v1/api/charting_service/v2/chart/exchange/NSE/segment/CASH/${symbol}/${config.path}`,
    { params }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

const getLivePrice = async (symbol) => {
  const normalizedSymbol = String(symbol ?? "").trim();
  const cachedKey = `market:price:${normalizedSymbol}`;

  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  if (!normalizedSymbol) return null;

  let livePrice = null;

  // 1) Prefer LTP/ticker endpoint (persists during market close)
  // If these are unavailable for a given symbol, we fall back to orderbook/chart.
  const ltpCandidates = [
    `/v1/api/stocks_data/v1/ltp/exchange/NSE/segment/CASH/${normalizedSymbol}/latest`,
    `/v1/api/stocks_data/v1/ticker/exchange/NSE/segment/CASH/${normalizedSymbol}/latest`,
    `/v1/api/stocks_data/v1/last_traded_price/exchange/NSE/segment/CASH/${normalizedSymbol}/latest`,
    `/v1/api/stocks_data/v1/ltp/${normalizedSymbol}`,
  ];

  for (const candidatePath of ltpCandidates) {
    try {
      const response = await growwClient.get(candidatePath);
      const data = response.data || {};

      const maybe =
        data?.ltp ??
        data?.lastTradedPrice ??
        data?.last_traded_price ??
        data?.lastPrice ??
        data?.price ??
        data?.data?.ltp ??
        data?.data?.lastTradedPrice;

      if (
        maybe !== null &&
        maybe !== undefined &&
        Number.isFinite(Number(maybe))
      ) {
        livePrice = Number(maybe);
        break;
      }
    } catch {
      // try next candidate
    }
  }

  // 2) Fallback to orderbook (may be empty off-hours)
  if (livePrice === null) {
    try {
      const response = await growwClient.get(
        `/v1/api/stocks_data/v1/tr_live_book/exchange/NSE/segment/CASH/${normalizedSymbol}/latest`
      );
      const data = response.data || {};
      const buyBook = data.buyBook || {};
      const sellBook = data.sellBook || {};

      const maybeBuy = buyBook?.["1"]?.price;
      const maybeSell = sellBook?.["1"]?.price;

      const fallbackBuy =
        maybeBuy ??
        (Object.keys(buyBook).length
          ? buyBook[Object.keys(buyBook)[0]]?.price
          : undefined);
      const fallbackSell =
        maybeSell ??
        (Object.keys(sellBook).length
          ? sellBook[Object.keys(sellBook)[0]]?.price
          : undefined);

      const obPrice = fallbackBuy ?? fallbackSell ?? null;
      if (
        obPrice !== null &&
        obPrice !== undefined &&
        Number.isFinite(Number(obPrice)) &&
        Number(obPrice) > 0
      ) {
        livePrice = Number(obPrice);
      }
    } catch (err) {
      console.warn(
        `tr_live_book check failed for ${normalizedSymbol}:`,
        err.message
      );
    }
  }

  // 3) Fallback: chart close price
  if (livePrice === null || Number(livePrice) <= 0) {
    try {
      const chartData = await getChartData(normalizedSymbol, "1D", "line");
      if (chartData?.candles && chartData.candles.length > 0) {
        const latestCandle =
          chartData.candles[chartData.candles.length - 1];
        livePrice = latestCandle[4] || chartData.closingPrice || null;
      } else if (chartData?.closingPrice) {
        livePrice = chartData.closingPrice;
      }
    } catch (err) {
      console.error(
        `Chart fallback price check failed for ${normalizedSymbol}:`,
        err.message
      );
    }
  }

  if (livePrice !== null && livePrice !== undefined && !isNaN(Number(livePrice))) {
    livePrice = Number(livePrice);
    await redisClient.set(cachedKey, JSON.stringify(livePrice), { EX: 15 });
  }

  return livePrice;
};

const searchStocks = async (query) => {
  const cachedKey = `market:search:${query}`;
  const cached = await redisClient.get(cachedKey);
  if (cached) {
    console.log("cache hit!");
    return JSON.parse(cached);
  }

  console.log("cache missed!");
  const response = await growwClient.get(
    "/v1/api/search/v3/query/global/st_p_query",
    {
      params: {
        page: 0,
        query,
        size: 10,
        web: true,
      },
    }
  );

  await redisClient.set(cachedKey, JSON.stringify(response.data), {
    EX: 15,
  });

  return response.data;
};

// Used by marketWorker; keep same semantics (persist price off-hours if possible)
const getFreshLivePrice = async (symbol) => {
  return getLivePrice(symbol);
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
  getFreshLivePrice,
};
