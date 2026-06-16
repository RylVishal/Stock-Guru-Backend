const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
    getPending,
    approve,
    reject
} = require("../controllers/adminController");

router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /admin/kyc/pending:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all pending KYC requests
 *     description: Returns a list of all KYC submissions awaiting admin review. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending KYC requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KycRecord'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/kyc/pending",
    getPending
);

/**
 * @swagger
 * /admin/kyc/{id}/approve:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Approve a KYC submission
 *     description: Marks the specified KYC record as approved. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the KYC record to approve
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: KYC approved successfully
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
 *                   example: KYC approved successfully
 *                 data:
 *                   $ref: '#/components/schemas/KycRecord'
 *       404:
 *         description: KYC record not found
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
 *       403:
 *         description: Forbidden - user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/kyc/:id/approve",
    approve
);

/**
 * @swagger
 * /admin/kyc/{id}/reject:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Reject a KYC submission
 *     description: Marks the specified KYC record as rejected. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the KYC record to reject
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: KYC rejected successfully
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
 *                   example: KYC rejected successfully
 *                 data:
 *                   $ref: '#/components/schemas/KycRecord'
 *       404:
 *         description: KYC record not found
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
 *       403:
 *         description: Forbidden - user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/kyc/:id/reject",
    reject
);

module.exports = router;