const http = require("http");

const env = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

const startMarketWorker =
require("./workers/marketWorker");

const {
    initializeSocket
} = require("./sockets/socket");

const server = http.createServer(app);

const start = async () => {

    try {

        await connectDB();

        initializeSocket(server);

        server.listen(env.PORT, () => {

            console.log(
                `Server running on ${env.PORT}`
            );

            startMarketWorker();

        });

    }

    catch(err){

        console.error(err);

    }

};

start();