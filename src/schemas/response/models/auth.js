const { z } = require("zod");

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email()
});

const LoginResponseSchema = z.object({
    

    accessToken: z.string(),

    refreshToken: z.string(),

    user: z.object({

        id: z.string(),

        name: z.string(),

        email: z.string().email(),

        role: z.enum([
            "user",
            "admin"
        ]),

        kycVerified: z.boolean()

    })

});

module.exports = {
    UserSchema,
    LoginResponseSchema
};