const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    forgotPasswordController,
    verifyOTPController,
    resetPasswordController,
    refreshAccessToken
} = require("../controllers/authController");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
} = require("../schemas/request/authValidation");
router.post(
    "/register",
    validate(registerSchema),
    register
);
router.post("/login",
    validate(loginSchema),
    login
);

router.post("/logout",
    authMiddleware,
    logout
);

router.post("/forgot-password",
    forgotPasswordController
);
router.post(
    "/verify-otp",
    validate(verifyOtpSchema),
    verifyOTPController
);

router.post("/reset-password",
    resetPasswordController
);
router.post(
    "/refresh-token",
    refreshAccessToken
);
module.exports = router;