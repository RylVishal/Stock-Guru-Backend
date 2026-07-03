const { z } = require("zod");

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
});

const TokenSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string()
});

module.exports = {
    UserSchema,
    TokenSchema
};