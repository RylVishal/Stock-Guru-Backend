const {
    getProfileService,
    updateProfileService
} = require("../services/userService");

const {
    success
} = require("../utils/responseBuilder");

const validateResponse =
require("../middlewares/validateResponse");

const {
    profileResponseSchema
} = require("../schemas/response/user");

const AppError = require("../utils/AppError");

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

const updateProfile = async (req, res, next) => {
    try {
        const { name, panNumber } = req.body;

        // Basic validation
        if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
            throw new AppError("Name must be a non-empty string", 400);
        }
        if (panNumber !== undefined && (typeof panNumber !== "string" || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber))) {
            throw new AppError("Invalid PAN Card format", 400);
        }

        const data = await updateProfileService(req.user.id, { name, panNumber });

        const response = success("Profile updated successfully", data);

        validateResponse(profileResponseSchema, response);

        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile,
    updateProfile
};