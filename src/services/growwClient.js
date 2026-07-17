const axios = require("axios");
const growwClient = axios.create({
    baseURL: "https://groww.in",
    timeout:10000
});

module.exports = growwClient;