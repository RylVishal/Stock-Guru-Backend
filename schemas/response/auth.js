const {
    createSuccessResponseSchema,
    createMessageResponseSchema
} = require("./responseFactory");

const {
    UserSchema,
    TokenSchema
} = require("./models/auth");

const registerResponseSchema =
    createSuccessResponseSchema(
        UserSchema
    );

const loginResponseSchema =
    createSuccessResponseSchema(
        TokenSchema
    );

const messageResponseSchema =
    createMessageResponseSchema();

module.exports = {
    registerResponseSchema,
    loginResponseSchema,
    messageResponseSchema
};