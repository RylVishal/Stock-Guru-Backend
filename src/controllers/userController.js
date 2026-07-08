const {
    getProfileService
} = require("../services/userService");

const {
    success
} = require("../utils/responseBuilder");

const validateResponse =
require("../middlewares/validateResponse");

const {
    profileResponseSchema
} = require("../schemas/response/user");

const getProfile = async (
    req,
    res,
    next
) => {

    try {

        const data =
        await getProfileService(
            req.user.id
        );

        const response =
        success(
            "Profile fetched successfully",
            data
        );

        validateResponse(
            profileResponseSchema,
            response
        );

        return res
        .status(200)
        .json(response);

    }

    catch(err){

        next(err);

    }

};

module.exports = {
    getProfile
};