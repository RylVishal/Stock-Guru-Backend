const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    forgotPasswordController,
    verifyOTPController,
    resetPasswordController
    // refreshaccesstoken
} = require("../contollers/authController");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const {registerSchema,loginSchema} = require("../validations/authValidation");

router.post("/register",
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

router.post("/verify-otp",
    verifyOTPController
);

router.post("/reset-password",
    resetPasswordController
);
// router.post("/refresh-token",
//     rStock@123efreshAccesstoken
// );


module.exports = router;