// require("./docs/swagger");

const http = require("http");
const env = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

const startMarketWorker =
    require("./workers/marketWorker");

const {
    initializeSocket
} = require("./sockets/socket");

const bootstrapTrackedSymbols = require("./workers/bootstrapTrackedSymbols");
const server = http.createServer(app);

const start = async () => {

    try {

        await connectDB();
        await bootstrapTrackedSymbols();
        initializeSocket(server);

        server.listen(env.PORT, () => {

            console.log(
                `Server running on ${env.PORT}`
            );
            startMarketWorker();

        });

    }

    catch (err) {

        console.error(err);

    }

};

start();