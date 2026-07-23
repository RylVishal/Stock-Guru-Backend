const { Server } = require("socket.io");

let io;

const initializeSocket = (httpServer) => {

    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                callback(null, true);
            },
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        console.log(`Client Connected : ${socket.id}`);

        socket.on("subscribe", (symbols) => {

            console.log(`${socket.id} subscribed`, symbols);

            symbols.forEach(symbol => {

                socket.join(symbol);

            });

        });

        socket.on("unsubscribe", (symbols) => {

            symbols.forEach(symbol => {

                socket.leave(symbol);

            });

        });

        socket.on("disconnect", () => {

            console.log(`${socket.id} disconnected`);

        });

    });

};

const getIO = () => io;

module.exports = {
    initializeSocket,
    getIO
};