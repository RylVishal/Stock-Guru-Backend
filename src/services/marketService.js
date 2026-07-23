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

  let data = null;
  try {
    const response = await growwClient.get(
      `/v1/api/charting_service/v2/chart/exchange/NSE/segment/CASH/${symbol}/${config.path}`,
      { params }
    );
    data = response.data;
  } catch (err) {
    console.warn(`Direct chart fetch failed for ${symbol} range ${range}:`, err.message);
  }

  // Fallback for daily chart when market is closed (e.g. weekends/holidays/fetch error)
  if (range.toUpperCase() === "1D" && (!data?.candles || data.candles.length === 0)) {
    console.log(`Daily chart empty or failed for ${symbol}. Trying weekly chart fallback...`);
    try {
      const weeklyConfig = CHART_CONFIG["1W"];
      const weeklyParams = { ...weeklyConfig.params };
      if (type === "line") {
        weeklyParams.minimal = true;
      }
      const weeklyResponse = await growwClient.get(
        `/v1/api/charting_service/v2/chart/exchange/NSE/segment/CASH/${symbol}/${weeklyConfig.path}`,
        { params: weeklyParams }
      );
      const weeklyData = weeklyResponse.data;
      if (weeklyData?.candles && weeklyData.candles.length > 0) {
        // Filter candles from the last active trading day in weekly chart
        const lastCandle = weeklyData.candles[weeklyData.candles.length - 1];
        const lastCandleTime = lastCandle[0];

        const getISTDate = (ts) => {
          const t = Number(ts);
          const date = Number.isFinite(t) ? new Date(t * 1000) : new Date(ts);
          return date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
        };

        const lastActiveDayStr = getISTDate(lastCandleTime);
        const filteredCandles = weeklyData.candles.filter(candle => {
          return getISTDate(candle[0]) === lastActiveDayStr;
        });

        if (filteredCandles.length > 0) {
          data = {
            ...weeklyData,
            candles: filteredCandles,
            isFallback: true,
            fallbackDate: lastActiveDayStr
          };
          console.log(`Successfully resolved daily chart fallback using weekly data. Active day: ${lastActiveDayStr}`);
        }
      }
    } catch (fallbackErr) {
      console.warn("Daily chart fallback using weekly data failed:", fallbackErr.message);
    }
  }

  if (!data) {
    throw new Error(`Failed to fetch chart data for ${symbol}`);
  }

  await redisClient.set(cachedKey, JSON.stringify(data), {
    EX: 15,
  });

  return data;
};

const fetchLivePriceFromSource = async (symbol) => {
  const normalizedSymbol = String(symbol ?? "").trim().toUpperCase();
  if (!normalizedSymbol) return null;

  // 1) Primary check: 1D Chart latest minute candle price (fast & accurate for NSE symbols)
  try {
    const config = CHART_CONFIG["1D"];
    const response = await growwClient.get(
      `/v1/api/charting_service/v2/chart/exchange/NSE/segment/CASH/${encodeURIComponent(normalizedSymbol)}/${config.path}`,
      { params: { ...config.params, minimal: true } }
    );
    const data = response.data;
    if (data?.candles && data.candles.length > 0) {
      const latestCandle = data.candles[data.candles.length - 1];
      const val = Array.isArray(latestCandle)
        ? (latestCandle.length > 2 ? latestCandle[4] : latestCandle[1])
        : (latestCandle?.close || latestCandle?.price);
      if (val && Number.isFinite(Number(val)) && Number(val) > 0) {
        return Number(val);
      }
    }
  } catch (err) {
    console.warn(`1D Chart price check failed for ${normalizedSymbol}:`, err.message);
  }

  // 2) Secondary check: 1W Chart latest candle price
  try {
    const config = CHART_CONFIG["1W"];
    const response = await growwClient.get(
      `/v1/api/charting_service/v2/chart/exchange/NSE/segment/CASH/${encodeURIComponent(normalizedSymbol)}/${config.path}`,
      { params: { ...config.params, minimal: true } }
    );
    const data = response.data;
    if (data?.candles && data.candles.length > 0) {
      const latestCandle = data.candles[data.candles.length - 1];
      const val = Array.isArray(latestCandle)
        ? (latestCandle.length > 2 ? latestCandle[4] : latestCandle[1])
        : (latestCandle?.close || latestCandle?.price);
      if (val && Number.isFinite(Number(val)) && Number(val) > 0) {
        return Number(val);
      }
    }
  } catch (err) {
    console.warn(`1W Chart price check failed for ${normalizedSymbol}:`, err.message);
  }

  // 3) Fallback: getCompanyDetails
  try {
    const searchIdCandidate = normalizedSymbol.toLowerCase();
    const details = await getCompanyDetails(searchIdCandidate);
    const cp =
      details?.priceData?.nse?.lastPrice ||
      details?.priceData?.bse?.lastPrice ||
      details?.priceData?.nse?.closePrice ||
      details?.priceData?.bse?.closePrice ||
      details?.stats?.closePrice;

    if (cp && Number.isFinite(Number(cp)) && Number(cp) > 0) {
      return Number(cp);
    }
  } catch (err) {
    console.warn(`Company details check skipped for ${normalizedSymbol}:`, err.message);
  }

  return null;
};

const getLivePrice = async (symbol) => {
  const normalizedSymbol = String(symbol ?? "").trim();
  const cachedKey = `market:price:${normalizedSymbol}`;

  const cached = await redisClient.get(cachedKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const livePrice = await fetchLivePriceFromSource(normalizedSymbol);
  if (livePrice !== null && livePrice !== undefined && !isNaN(Number(livePrice))) {
    const numPrice = Number(livePrice);
    await redisClient.set(cachedKey, JSON.stringify(numPrice), { EX: 10 });
    return numPrice;
  }

  return livePrice;
};

// Used by marketWorker; bypasses Redis cache read so marketWorker always fetches fresh live prices from source!
const getFreshLivePrice = async (symbol) => {
  const normalizedSymbol = String(symbol ?? "").trim();
  const cachedKey = `market:price:${normalizedSymbol}`;

  const freshPrice = await fetchLivePriceFromSource(normalizedSymbol);
  if (freshPrice !== null && freshPrice !== undefined && !isNaN(Number(freshPrice))) {
    const numPrice = Number(freshPrice);
    await redisClient.set(cachedKey, JSON.stringify(numPrice), { EX: 15 });
    return numPrice;
  }
  return null;
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
