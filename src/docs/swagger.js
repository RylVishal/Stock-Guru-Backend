const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const successEnvelope = (dataSchema, message) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: message },
    data: dataSchema
  }
});

const errorResponse = (message, extraExample = {}) => ({
  description: message,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: message },
          errors: { type: 'array', items: { type: 'object' } }
        }
      },
      example: {
        success: false,
        message,
        ...extraExample
      }
    }
  }
});

const validationFailed = {
  description: 'Validation Failed',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'array', items: { type: 'string' } },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      example: {
        success: false,
        message: 'Validation failed',
        errors: [
          { path: ['body', 'email'], message: 'Invalid email' }
        ]
      }
    }
  }
};

const unauthorized = errorResponse('Unauthorized');
const forbidden = errorResponse('Forbidden');
const notFound = errorResponse('Not Found');
const conflict = errorResponse('Conflict');
const serverError = errorResponse('Internal Server Error');

const protectedErrors = {
  400: validationFailed,
  401: unauthorized,
  403: forbidden,
  404: notFound,
  409: conflict,
  500: serverError
};

const publicErrors = {
  400: validationFailed,
  404: notFound,
  409: conflict,
  500: serverError
};

const bearerSecurity = [{ bearerAuth: [] }];

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Stock Guru API',
    version: '1.0.0',
    description:
      'Paper trading and market data platform. Integrates MongoDB, Redis, JWT authentication, and the Groww market data API as an upstream data source.'
  },
  servers: [
    { url: '/api/', description: 'Default API base path' }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'KYC', description: 'Know Your Customer verification' },
    { name: 'Admin', description: 'Administrative operations' },
    { name: 'Market', description: 'Market data proxied from Groww' },
    { name: 'Portfolio', description: 'Paper trading portfolio operations' },
    { name: 'Watchlist', description: 'User watchlist management' },
    { name: 'Health', description: 'Service health check' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account with name, email and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                name: 'Vishal',
                email: 'vishal@codingmart.in',
                password: 'Vishal@123'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'User registered successfully',
                  data: {
                    id: '6874b3f4d12ef92f8cb12345',
                    name: 'Vishal',
                    email: 'vishal@codingmart.in'
                  }
                }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        description: 'Authenticates a user and returns an access token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                email: 'vishal@codingmart.in',
                password: 'Vishal@123'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Login successful',
                  data: {
                    user: {
                      id: '6874b3f4d12ef92f8cb12345',
                      name: 'Vishal',
                      email: 'vishal@codingmart.in',
                      role: 'user'
                    },
                    accessToken: 'jwt-access-token'
                  }
                }
              }
            }
          },
          400: validationFailed,
          401: unauthorized,
          404: notFound,
          500: serverError
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout the current user',
        description: 'Invalidates the current session/token.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Logged out successfully',
                  data: null
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset OTP',
        description: 'Sends a single-use, TTL-bound OTP to the user email via Redis.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { email: 'vishal@codingmart.in' }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP sent successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'OTP sent successfully',
                  data: null
                }
              }
            }
          },
          400: validationFailed,
          404: notFound,
          500: serverError
        }
      }
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify password reset OTP',
        description: 'Verifies the OTP issued during forgot-password flow.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { email: 'vishal@codingmart.in', otp: '123456' }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP verified successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'OTP verified successfully',
                  data: null
                }
              }
            }
          },
          400: validationFailed,
          401: unauthorized,
          404: notFound,
          500: serverError
        }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        description: 'Resets the user password after a verified OTP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                email: 'vishal@codingmart.in',
                newPassword: 'NewVishal@123'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Password reset successful',
                  data: null
                }
              }
            }
          },
          400: validationFailed,
          401: unauthorized,
          404: notFound,
          500: serverError
        }
      }
    },
    '/kyc/submit': {
      post: {
        tags: ['KYC'],
        summary: 'Submit KYC details',
        description: 'Submits PAN details for KYC verification.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { panNumber: 'ABCDE1234F' }
            }
          }
        },
        responses: {
          201: {
            description: 'KYC submitted successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'KYC submitted successfully',
                  data: { status: 'PENDING' }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/kyc/status': {
      get: {
        tags: ['KYC'],
        summary: 'Get KYC status',
        description: 'Fetches the current KYC verification status for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'KYC status fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'KYC status fetched successfully',
                  data: { status: 'APPROVED' }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/admin/kyc/pending': {
      get: {
        tags: ['Admin'],
        summary: 'List pending KYC submissions',
        description: 'Fetches all KYC submissions with a PENDING status. Admin only.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Pending KYC fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Pending KYC fetched successfully',
                  data: [
                    {
                      id: '...',
                      name: 'Vishal',
                      email: 'vishal@codingmart.in',
                      panNumber: 'ABCDE1234F'
                    }
                  ]
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/admin/kyc/{id}/approve': {
      patch: {
        tags: ['Admin'],
        summary: 'Approve a KYC submission',
        description: 'Approves the KYC submission for the given user id. Admin only.',
        security: bearerSecurity,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'KYC submission / user id'
          }
        ],
        responses: {
          200: {
            description: 'KYC approved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'KYC approved successfully',
                  data: null
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/admin/kyc/{id}/reject': {
      patch: {
        tags: ['Admin'],
        summary: 'Reject a KYC submission',
        description: 'Rejects the KYC submission for the given user id. Admin only.',
        security: bearerSecurity,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'KYC submission / user id'
          }
        ],
        responses: {
          200: {
            description: 'KYC rejected successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'KYC rejected successfully',
                  data: null
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/market/most-bought': {
      get: {
        tags: ['Market'],
        summary: 'Most bought companies',
        description:
          'Proxies the Groww "most bought" companies response as-is. Response is NOT wrapped in the standard envelope.',
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: {
                  exploreCompanies: { '...': 'Original Groww Response' }
                }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/top-gainers': {
      get: {
        tags: ['Market'],
        summary: 'Top gaining stocks',
        description: 'Proxies the Groww top gainers response as-is.',
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: { data: { stocks: [] } }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/top-losers': {
      get: {
        tags: ['Market'],
        summary: 'Top losing stocks',
        description: 'Proxies the Groww top losers response as-is.',
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: { data: { stocks: [] } }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/trending-sectors': {
      get: {
        tags: ['Market'],
        summary: 'Trending sectors',
        description: 'Proxies the Groww trending sectors response as-is.',
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: { data: { sectors: [] } }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/news': {
      get: {
        tags: ['Market'],
        summary: 'Market news feed',
        description: 'Proxies the Groww market news response as-is.',
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: { feed: [] }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/search': {
      get: {
        tags: ['Market'],
        summary: 'Search stocks/companies',
        description: 'Proxies the Groww search response as-is.',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Search keyword, e.g. company name or symbol'
          }
        ],
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: {
                  errors: null,
                  message: null,
                  data: { content: [] }
                }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/stock/{searchId}': {
      get: {
        tags: ['Market'],
        summary: 'Get company details',
        description: 'Proxies the Groww company details response as-is.',
        parameters: [
          {
            name: 'searchId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Groww search id for the company, e.g. infosys-ltd'
          }
        ],
        responses: {
          200: {
            description: 'Original Groww Company Details response',
            content: {
              'application/json': {
                example: { '...': 'Original Groww Company Details Response' }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/market/chart/{symbol}': {
      get: {
        tags: ['Market'],
        summary: 'Get candlestick chart data',
        description: 'Proxies the Groww chart candle response as-is.',
        parameters: [
          {
            name: 'symbol',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stock symbol, e.g. INFY'
          }
        ],
        responses: {
          200: {
            description: 'Original Groww response',
            content: {
              'application/json': {
                example: { candles: [] }
              }
            }
          },
          ...publicErrors
        }
      }
    },
    '/portfolio/buy': {
      post: {
        tags: ['Portfolio'],
        summary: 'Buy a stock',
        description: 'Executes a paper trading buy order.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { searchId: 'infosys-ltd', quantity: 5 }
            }
          }
        },
        responses: {
          201: {
            description: 'Stock purchased successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Stock purchased successfully',
                  data: {
                    symbol: 'INFY',
                    companyName: 'Infosys',
                    quantity: 5,
                    price: 1520.35,
                    totalCost: 7601.75
                  }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/portfolio/sell': {
      post: {
        tags: ['Portfolio'],
        summary: 'Sell a stock',
        description: 'Executes a paper trading sell order.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { searchId: 'infosys-ltd', quantity: 2 }
            }
          }
        },
        responses: {
          200: {
            description: 'Stock sold successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Stock sold successfully',
                  data: {
                    symbol: 'INFY',
                    quantity: 2,
                    sellPrice: 1550.20,
                    saleAmount: 3100.40,
                    pnl: 120.40
                  }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/portfolio/holdings': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get current holdings',
        description: 'Fetches all current stock holdings for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Holdings fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Holdings fetched successfully',
                  data: [
                    {
                      id: '...',
                      symbol: 'INFY',
                      companyName: 'Infosys',
                      quantity: 5,
                      avgPrice: 1520.35
                    }
                  ]
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/portfolio/history': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get transaction history',
        description: 'Fetches all buy/sell transactions for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Transaction history fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Transaction history fetched successfully',
                  data: [
                    {
                      symbol: 'INFY',
                      companyName: 'Infosys',
                      type: 'BUY',
                      quantity: 5,
                      price: 1520.35,
                      amount: 7601.75,
                      createdAt: '2026-07-03T10:15:00Z'
                    }
                  ]
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/portfolio/summary': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get portfolio summary',
        description: 'Fetches a high-level summary of the authenticated user portfolio.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Portfolio summary fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Portfolio summary fetched successfully',
                  data: {
                    cashBalance: 92398.25,
                    totalInvested: 7601.75,
                    totalProfitLoss: 500.25,
                    holdingsCount: 3
                  }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/portfolio/analytics': {
      get: {
        tags: ['Portfolio'],
        summary: 'Get portfolio analytics',
        description: 'Fetches detailed analytics including top winner/loser for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Portfolio analytics fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Portfolio analytics fetched successfully',
                  data: {
                    analytics: {
                      portfolioValue: 8102,
                      investedValue: 7601.75,
                      unrealizedPnL: 500.25,
                      returnPercentage: 6.58,
                      cashBalance: 92398.25,
                      totalAccountValue: 100500.25
                    },
                    topWinner: {
                      id: '...',
                      symbol: 'INFY',
                      companyName: 'Infosys',
                      quantity: 5,
                      avgPrice: 1520.35,
                      currentPrice: 1620.40,
                      investedValue: 7601.75,
                      currentValue: 8102,
                      pnl: 500.25,
                      returnPercent: 6.58
                    },
                    topLoser: null,
                    holdings: []
                  }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/watchlist/add': {
      post: {
        tags: ['Watchlist'],
        summary: 'Add a stock to watchlist',
        description: 'Adds a stock to the authenticated user watchlist.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { searchId: 'infosys-ltd' }
            }
          }
        },
        responses: {
          201: {
            description: 'Stock added to watchlist',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Stock added to watchlist',
                  data: {
                    id: '...',
                    searchId: 'infosys-ltd',
                    symbol: 'INFY',
                    companyName: 'Infosys'
                  }
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/watchlist': {
      get: {
        tags: ['Watchlist'],
        summary: 'Get watchlist',
        description: 'Fetches the authenticated user watchlist with live prices.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Watchlist fetched successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Watchlist fetched successfully',
                  data: [
                    {
                      symbol: 'INFY',
                      companyName: 'Infosys',
                      searchId: 'infosys-ltd',
                      livePrice: 1620.45
                    }
                  ]
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/watchlist/{symbol}': {
      delete: {
        tags: ['Watchlist'],
        summary: 'Remove a stock from watchlist',
        description: 'Removes the given symbol from the authenticated user watchlist.',
        security: bearerSecurity,
        parameters: [
          {
            name: 'symbol',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stock symbol, e.g. INFY'
          }
        ],
        responses: {
          200: {
            description: 'Removed from watchlist',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Removed from watchlist',
                  data: null
                }
              }
            }
          },
          ...protectedErrors
        }
      }
    },
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Simple liveness check endpoint.',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                example: { message: 'Yo its healthy' }
              }
            }
          },
          500: serverError
        }
      }
    }
  }
};


function setupSwagger(app, path = '/api-docs') {
  app.use(path, swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

module.exports = { openApiSpec, setupSwagger };