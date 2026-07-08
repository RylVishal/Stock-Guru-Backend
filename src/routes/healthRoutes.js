const express = require("express");
const router = express.Router();

router.get('/',(req,res)=>{
    console.log("its health check baby");
    res.send("Yo its healthy");
});

module.exports = router;
