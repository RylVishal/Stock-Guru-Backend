const { createSuccessResponseSchema }
= require("./responseFactory");

const {
    UserProfileSchema
} = require("./models/user");

const profileResponseSchema =
createSuccessResponseSchema(
    UserProfileSchema
);

module.exports = {
    profileResponseSchema
};