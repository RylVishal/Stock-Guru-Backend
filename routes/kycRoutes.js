const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/authMiddleware");

const {
    submit,
    status
} = require("../controllers/kycController");
const {kycSchema} = require("../schemas/request/kycValidation");
router.post(
    "/submit",
    authMiddleware,
    validate(kycSchema),
    submit
);

router.get(
    "/status",
    authMiddleware,
    status
);

module.exports = router;