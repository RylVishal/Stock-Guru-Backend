const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");

const {
    kycIdSchema
} = require("../schemas/request/adminValidation");

const {
    getPending,
    approve,
    reject
} = require("../controllers/adminController");

router.use(authMiddleware, adminMiddleware);

router.get(
    "/kyc/pending",
    getPending
);

router.patch(
    "/kyc/:id/approve",
    validate(kycIdSchema),
    approve
);

router.patch(
    "/kyc/:id/reject",
    validate(kycIdSchema),
    reject
);

module.exports = router;