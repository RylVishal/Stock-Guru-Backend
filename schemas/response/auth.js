const {
    createSuccessResponseSchema,
    createMessageResponseSchema
} = require("./responseFactory");

const {
    UserSchema,
    LoginResponseSchema
} = require("./models/auth");

const registerResponseSchema =
    createSuccessResponseSchema(
        UserSchema
    );

const loginResponseSchema =
    createSuccessResponseSchema(
        LoginResponseSchema
    );

const messageResponseSchema =
    createMessageResponseSchema();

module.exports = {
    registerResponseSchema,
    loginResponseSchema,
    messageResponseSchema
};