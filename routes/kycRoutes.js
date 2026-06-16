const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
    submit,
    status
} = require("../controllers/kycController");

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     tags:
 *       - KYC
 *     summary: Submit KYC details
 *     description: Allows an authenticated user to submit their KYC document details for verification.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KycSubmitRequest'
 *     responses:
 *       201:
 *         description: KYC submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: KYC submitted successfully, pending review
 *                 data:
 *                   $ref: '#/components/schemas/KycRecord'
 *       400:
 *         description: Validation error or KYC already submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/submit",
    authMiddleware,
    submit
);

/**
 * @swagger
 * /kyc/status:
 *   get:
 *     tags:
 *       - KYC
 *     summary: Get KYC status
 *     description: Returns the current KYC verification status for the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current KYC status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KycStatusResponse'
 *       404:
 *         description: No KYC submission found for this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    "/status",
    authMiddleware,
    status
);

module.exports = router;