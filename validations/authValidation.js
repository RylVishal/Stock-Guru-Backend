const {z} = require("zod");
const registerSchema = z.object({
    name:z
        .string()
        .min(3, "Name must be at least 3 chars long!")
        .max(50,"Name is too long"),
    
    email:z
        .string()
        .email("Invalid email"),
    
    password:z
        .string()
        .min(8,"password must be atleast 8 chars long")
        .max(50,"password toolong!")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
           "Password must contain uppercase, lowercase and number"
        )
});

const loginSchema = z.object({
    email:z.string().email("Invalid Email"),
    password:z.string().min(8,"Password should be greater then or equal to 8 chars long")
});
const resetPasswordSchema = z.object({
        password:z
        .string()
        .min(8,"password must be atleast 8 chars long")
        .max(50,"password toolong!")
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
           "Password must contain uppercase, lowercase and number"
        )
});
module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordSchema
};