const {
    OpenApiGeneratorV3
} = require(
    "@asteasolutions/zod-to-openapi"
);

const registry =
require("./registry");

require("./auth.docs");
require("./kyc.docs");
require("./admin.docs");
require("./portfolio.docs");
require("./watchlist.docs");
require("./market.docs");

const generator =
new OpenApiGeneratorV3(
    registry.definitions
);

module.exports =
generator.generateDocument({

    openapi: "3.0.3",

    info: {
        title: "Stock Guru API",
        version: "1.0.0",
        description:
        "Stock Guru Backend API"
    },

    servers: [
        {
            url:
            "http://localhost:5000/api"
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
});