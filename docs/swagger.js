const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Stock Guru API",
        description: "REST API for Stock Guru",
        version: "1.0.0"
    },

    host: "localhost:5000",

    schemes: ["http"],

    securityDefinitions: {
        BearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "Bearer <JWT>"
        }
    }
};
const outputFile = "./swagger-output.json";

const endpointsFiles = [
    "./app.js"
];

swaggerAutogen(
    outputFile,
    endpointsFiles,
    doc
);