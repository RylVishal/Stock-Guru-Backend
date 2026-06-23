const path = require("path");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stock Guru API",
      version: "1.0.0",
      description:
        "REST API documentation for Stock Guru - covers authentication, KYC, admin review, market data, portfolio management, and watchlist."
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {

        // ─── Shared ───────────────────────────────────────────────────
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" }
          }
        },

        // ─── Auth ─────────────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name:     { type: "string", example: "Vishal Kumar" },
            email:    { type: "string", format: "email", example: "vishal@example.com" },
            password: { type: "string", format: "password", example: "StrongPass@123" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "vishal@example.com" },
            password: { type: "string", format: "password", example: "StrongPass@123" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            token:   { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: {
              type: "object",
              properties: {
                id:    { type: "string", example: "6a352707967c4c88c80331bd" },
                name:  { type: "string", example: "Vishal Kumar" },
                email: { type: "string", example: "vishal@example.com" }
              }
            }
          }
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "vishal@example.com" }
          }
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email", example: "vishal@example.com" },
            otp:   { type: "string", example: "583921" }
          }
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email:       { type: "string", format: "email", example: "vishal@example.com" },
            otp:         { type: "string", example: "583921" },
            newPassword: { type: "string", format: "password", example: "NewStrongPass@456" }
          }
        },

        // ─── KYC ──────────────────────────────────────────────────────
        KycSubmitRequest: {
          type: "object",
          required: ["documentType", "documentNumber"],
          properties: {
            documentType:   { type: "string", example: "PAN" },
            documentNumber: { type: "string", example: "ABCDE1234F" }
          }
        },
        KycStatusResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            status:  { type: "string", enum: ["pending", "approved", "rejected"], example: "pending" },
            remarks: { type: "string", example: "Under review" }
          }
        },
        KycRecord: {
          type: "object",
          properties: {
            id:             { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            userId:         { type: "string", example: "6a352707967c4c88c80331bd" },
            documentType:   { type: "string", example: "PAN" },
            documentNumber: { type: "string", example: "ABCDE1234F" },
            status:         { type: "string", enum: ["pending", "approved", "rejected"], example: "pending" },
            createdAt:      { type: "string", format: "date-time", example: "2026-06-10T09:22:11.000Z" }
          }
        },

        // ─── Market ───────────────────────────────────────────────────
        MostBoughtCompanyInfo: {
          type: "object",
          properties: {
            isin:             { type: "string", example: "INE093R01011" },
            growwContractId:  { type: "string", example: "GSTK539992" },
            companyName:      { type: "string", example: "Lloyds Engineering Works" },
            searchId:         { type: "string", example: "lloyds-steels-industries-ltd" },
            nseScriptCode:    { type: "string", example: "LLOYDSENGG" },
            companyStatus:    { type: "string", example: "STOCK" },
            companyShortName: { type: "string", example: "Lloyds Engr Works" },
            bseScriptCode:    { type: "string", example: "539992" },
            imageUrl:         { type: "string", format: "uri", example: "https://assets-netstorage.groww.in/..." }
          }
        },
        MostBoughtStats: {
          type: "object",
          properties: {
            type:           { type: "string", example: "LIVE_PRICE" },
            high:           { type: "number", example: 81 },
            low:            { type: "number", example: 71.8 },
            close:          { type: "number", example: 71.35 },
            ltp:            { type: "number", example: 79.94 },
            dayChange:      { type: "number", example: 8.59 },
            dayChangePerc:  { type: "number", example: 12.04 },
            lowPriceRange:  { type: "number", example: 57.08 },
            highPriceRange: { type: "number", example: 85.62 }
          }
        },
        MostBoughtEntry: {
          type: "object",
          properties: {
            company: { "$ref": "#/components/schemas/MostBoughtCompanyInfo" },
            stats:   { "$ref": "#/components/schemas/MostBoughtStats" }
          }
        },
        MarketStock: {
          type: "object",
          description: "Stock entry returned from top-gainers / top-losers",
          properties: {
            isin:             { type: "string", example: "INE860A01027" },
            gsin:             { type: "string", example: "GSTK532281" },
            companyName:      { type: "string", example: "HCL Technologies" },
            companyShortName: { type: "string", example: "HCL Tech." },
            searchId:         { type: "string", example: "hcl-technologies-ltd" },
            ltp:              { type: "number", example: 1159 },
            logoUrl:          { type: "string", format: "uri" },
            nseScriptCode:    { type: "string", example: "HCLTECH" },
            bseScriptCode:    { type: "string", example: "532281" },
            type:             { type: "string", example: "STOCKS" },
            marketCap:        { type: "number", example: 303699.83 },
            volumeWeekAvg:    { type: "number", example: 0 },
            close:            { type: "number", example: 1119.3 },
            yearHigh:         { type: "number", example: 1780.1 },
            yearLow:          { type: "number", example: 1089.5 },
            tag:              { type: "string", example: "In news" },
            tagColor:         { type: "string", example: "contentAccentSecondary" }
          }
        },
        TopMoversResponse: {
          type: "object",
          properties: {
            age:         { type: "integer", example: 0 },
            cacheStatus: { type: "string", example: "BYPASS" },
            name:        { type: "string", example: "top_movers" },
            data: {
              type: "object",
              properties: {
                title:  { type: "string", example: "Top Gainers" },
                stocks: {
                  type: "array",
                  items: { "$ref": "#/components/schemas/MarketStock" }
                }
              }
            }
          }
        },
        TrendingSector: {
          type: "object",
          properties: {
            sectorName:       { type: "string", example: "Water Distribution" },
            sectorLogo:       { type: "string", format: "uri" },
            darkLogo:         { type: "string", format: "uri" },
            totalStocks:      { type: "integer", example: 9 },
            positiveStocks:   { type: "integer", example: 7 },
            negativeStocks:   { type: "integer", example: 2 },
            dayChangePercent: { type: "number", example: 4.89 },
            industryCode:     { type: "string", example: "GIC-00060" }
          }
        },
        TrendingSectorsResponse: {
          type: "object",
          properties: {
            age:         { type: "integer", example: 0 },
            cacheStatus: { type: "string", example: "BYPASS" },
            name:        { type: "string", example: "trending_sectors" },
            data: {
              type: "object",
              properties: {
                title:   { type: "string", example: "Trending Sectors" },
                sectors: {
                  type: "array",
                  items: { "$ref": "#/components/schemas/TrendingSector" }
                }
              }
            }
          }
        },
        NewsItem: {
          type: "object",
          properties: {
            name:         { type: "string", example: "731967_Dhabriya Polywood Ltd.-1-VariationA" },
            postId:       { type: "string", example: "731967_Dhabriya Polywood Ltd.-1-VariationA" },
            publisher:    { type: "string", example: "Stock News Summary" },
            publishedAt:  { type: "string", format: "date-time", example: "2026-06-22T18:08:52" },
            expireAt:     { type: "string", format: "date-time" },
            campaignType: { type: "string", example: "GENERIC" },
            data: {
              type: "object",
              properties: {
                title: { type: "string", example: "Dhabriya Polywood Unit Bags ₹13.05 Cr Order" },
                body:  { type: "string", example: "Dhabriya Polywood's subsidiary received a ₹13.05 Cr order..." },
                cta:   { type: "array", items: { type: "object" } },
                media: { type: "array", items: { type: "object" } }
              }
            }
          }
        },
        StockHeader: {
          type: "object",
          properties: {
            searchId:        { type: "string", example: "hcl-technologies-ltd" },
            growwCompanyId:  { type: "string", example: "GSTK532281" },
            isin:            { type: "string", example: "INE860A01027" },
            industryName:    { type: "string", example: "Information Technology" },
            displayName:     { type: "string", example: "HCL Technologies" },
            shortName:       { type: "string", example: "HCL Tech." },
            type:            { type: "string", example: "STOCK" },
            isFnoEnabled:    { type: "boolean", example: true },
            nseScriptCode:   { type: "string", example: "HCLTECH" },
            bseScriptCode:   { type: "string", example: "532281" },
            nseTradingSymbol:{ type: "string", example: "HCLTECH-EQ" },
            logoUrl:         { type: "string", format: "uri" },
            floatingShares:  { type: "integer", example: 1048677765 }
          }
        },
        StockDetails: {
          type: "object",
          properties: {
            fullName:        { type: "string", example: "HCL Technologies" },
            parentCompany:   { type: "string", example: "HCL Technologies Limited" },
            headquarters:    { type: "string", example: "NOIDA" },
            ceo:             { type: "string", example: "C Vijayakumar" },
            managingDirector:{ type: "string", example: "C Vijayakumar" },
            foundedYear:     { type: "integer", example: 1981 },
            businessSummary: { type: "string" },
            websiteUrl:      { type: "string", format: "uri", example: "https://www.hcltech.com/" }
          }
        },
        StockDetailResponse: {
          type: "object",
          properties: {
            header:  { "$ref": "#/components/schemas/StockHeader" },
            details: { "$ref": "#/components/schemas/StockDetails" }
          }
        },

        // ─── Portfolio ────────────────────────────────────────────────
        BuyRequest: {
          type: "object",
          required: ["symbol", "companyName", "quantity"],
          properties: {
            symbol:      { type: "string", example: "INFY" },
            companyName: { type: "string", example: "Infosys" },
            quantity:    { type: "integer", example: 5 }
          }
        },
        BuyResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Stock Purchased Successfully" },
            data: {
              type: "object",
              properties: {
                symbol:      { type: "string", example: "INFY" },
                companyName: { type: "string", example: "Infosys" },
                quantity:    { type: "integer", example: 5 },
                price:       { type: "number", example: 1031.85 },
                totalCost:   { type: "number", example: 5159.25 }
              }
            }
          }
        },
        SellRequest: {
          type: "object",
          required: ["symbol", "quantity"],
          properties: {
            symbol:   { type: "string", example: "INFY" },
            quantity: { type: "integer", example: 5 }
          }
        },
        SellResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Stock sold successfully" },
            data: {
              type: "object",
              properties: {
                symbol:     { type: "string", example: "INFY" },
                quantity:   { type: "integer", example: 5 },
                sellPrice:  { type: "number", example: 1038.05 },
                saleAmount: { type: "number", example: 5190.25 },
                pnl:        { type: "number", example: 31.25 }
              }
            }
          }
        },
        Holding: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "6a3905ff7d1503f0424ebf4c" },
            userId:      { type: "string", example: "6a352707967c4c88c80331bd" },
            symbol:      { type: "string", example: "HCLTECH" },
            companyName: { type: "string", example: "HCL Technologies" },
            quantity:    { type: "integer", example: 5 },
            avgPrice:    { type: "number", example: 1129.5 },
            createdAt:   { type: "string", format: "date-time", example: "2026-06-22T09:53:03.345Z" },
            updatedAt:   { type: "string", format: "date-time", example: "2026-06-22T09:53:03.345Z" }
          }
        },
        HistoryRecord: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "6a3a1e7ae21a20d9388690bd" },
            userId:      { type: "string", example: "6a352707967c4c88c80331bd" },
            symbol:      { type: "string", example: "INFY" },
            companyName: { type: "string", example: "Infosys" },
            type:        { type: "string", enum: ["BUY", "SELL"], example: "SELL" },
            quantity:    { type: "integer", example: 5 },
            price:       { type: "number", example: 1038.05 },
            amount:      { type: "number", example: 5190.25 },
            createdAt:   { type: "string", format: "date-time", example: "2026-06-23T05:49:46.818Z" },
            updatedAt:   { type: "string", format: "date-time" }
          }
        },
        PortfolioSummary: {
          type: "object",
          properties: {
            cashBalance:     { type: "number", example: 89224.75 },
            totalInvested:   { type: "number", example: 15965.5 },
            totalProfitLoss: { type: "number", example: 31.25 },
            holdingsCount:   { type: "integer", example: 2 }
          }
        },
        AnalyticsHolding: {
          type: "object",
          properties: {
            symbol:        { type: "string", example: "INFY" },
            companyName:   { type: "string", example: "Infosys" },
            quantity:      { type: "integer", example: 10 },
            avgPrice:      { type: "number", example: 1031.8 },
            currentPrice:  { type: "number", example: 1035.35 },
            investedValue: { type: "number", example: 10318 },
            currentValue:  { type: "number", example: 10353.5 },
            pnl:           { type: "number", example: 35.5 },
            returnPercent: { type: "number", example: 0.34 }
          }
        },
        PortfolioAnalyticsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            analytics: {
              type: "object",
              properties: {
                portfolioValue:     { type: "number", example: 15937.75 },
                investedValue:      { type: "number", example: 15965.5 },
                unrealizedPnL:      { type: "number", example: -27.75 },
                returnPercentage:   { type: "number", example: -0.17 },
                cashBalance:        { type: "number", example: 84034.5 },
                totalAccountValue:  { type: "number", example: 99972.25 }
              }
            },
            topWinner: { "$ref": "#/components/schemas/AnalyticsHolding" },
            topLoser:  { "$ref": "#/components/schemas/AnalyticsHolding" },
            holdings: {
              type: "array",
              items: { "$ref": "#/components/schemas/AnalyticsHolding" }
            }
          }
        },

        // ─── Watchlist ────────────────────────────────────────────────
        WatchlistAddRequest: {
          type: "object",
          required: ["symbol", "companyName", "searchId"],
          properties: {
            symbol:      { type: "string", example: "INFY" },
            companyName: { type: "string", example: "Infosys" },
            searchId:    { type: "string", example: "infosys-ltd" }
          }
        },
        WatchlistItem: {
          type: "object",
          description: "Watchlist document as stored in MongoDB",
          properties: {
            _id:         { type: "string", example: "6a3a14bd8d68381a66bc0799" },
            userId:      { type: "string", example: "6a352707967c4c88c80331bd" },
            symbol:      { type: "string", example: "INFY" },
            companyName: { type: "string", example: "Infosys" },
            searchId:    { type: "string", example: "infosys-ltd" },
            createdAt:   { type: "string", format: "date-time", example: "2026-06-23T05:08:13.305Z" },
            updatedAt:   { type: "string", format: "date-time" }
          }
        },
        WatchlistEntry: {
          type: "object",
          description: "Watchlist item enriched with live price",
          properties: {
            symbol:      { type: "string", example: "INFY" },
            companyName: { type: "string", example: "Infosys" },
            searchId:    { type: "string", example: "infosys-ltd" },
            livePrice:   { type: "number", example: 1033.55 }
          }
        }
      }
    },
    tags: [
      { name: "Authentication", description: "Registration, login, logout, and OTP-based password reset" },
      { name: "KYC",            description: "KYC submission and status lookup for end users" },
      { name: "Admin",          description: "Admin-only KYC review and approval workflows" },
      { name: "Market",         description: "Market data: most-bought, gainers, losers, sectors, news, stock details, charts" },
      { name: "Portfolio",      description: "Buy/sell stocks and track holdings, history, P&L, and analytics" },
      { name: "Watchlist",      description: "Add, view, and remove stocks from the personal watchlist" }
    ]
  },
  apis: [path.join(__dirname, "../routes/*.js")]
};

module.exports = swaggerJsDoc(options);