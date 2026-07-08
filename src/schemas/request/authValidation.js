const { z } = require("zod");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long")
    .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
        "Password must contain uppercase, lowercase and number"
    );

const registerSchema = z.object({

    body: z.object({

        name: z.string()
            .min(3)
            .max(50),

        email: z.string().email(),

        password: passwordSchema

    })

});
const loginSchema = z.object({

    body: z.object({

        email: z.string().email(),

        password: z.string().min(8)

    })

});

const forgotPasswordSchema = z.object({

    body: z.object({

        email: z.string().email()

    })

});

const verifyOtpSchema = z.object({

    body: z.object({

        email: z.string().email(),

        otp: z.string().length(6)

    })

});

const resetPasswordSchema = z.object({

    body: z.object({

        email: z.string().email(),

        otp: z.string().length(6),

        newPassword: passwordSchema

    })
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema
};