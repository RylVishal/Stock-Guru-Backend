const {
    addToWatchlistService,
    getWatchlistService,
    removeFromWatchlistService
} = require(
    "../services/watchlistService"
);

const addToWatchlist =
async(req,res,next)=>{
    try{

        const {searchId} =
            req.body;

        const result =
            await addToWatchlistService(
                req.user.id,
                searchId
            );

        res.status(201).json({
            success:true,
            data:result
        });

    }catch(err){
        next(err);
    }
};

const getWatchlist =
async(req,res,next)=>{
    try{

        const result =
            await getWatchlistService(
                req.user.id
            );

        res.status(200)
           .json(result);

    }catch(err){
        next(err);
    }
};

const removeFromWatchlist = async(req,res,next)=>{
    try{

        const {symbol} = req.params;

        const result =
        await removeFromWatchlistService(
            req.user.id,
            symbol
        );

        res.status(200).json(result);

    }catch(err){
        next(err);
    }
};
module.exports = {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist
};