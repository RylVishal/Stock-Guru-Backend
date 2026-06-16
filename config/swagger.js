const path = require("path");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Stock Guru API",
            version: "1.0.0",
            description:
                "REST API documentation for Stock Guru - covers user authentication, OTP-based password reset, KYC submission, and admin KYC review workflows."
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Local development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Something went wrong" }
                    }
                },
                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Vishal Kumar" },
                        email: { type: "string", format: "email", example: "vishal@example.com" },
                        password: { type: "string", format: "password", example: "StrongPass@123" }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "vishal@example.com" },
                        password: { type: "string", format: "password", example: "StrongPass@123" }
                    }
                },
                AuthResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Login successful" },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                                name: { type: "string", example: "Vishal Kumar" },
                                email: { type: "string", example: "vishal@example.com" }
                            }
                        }
                    }
                },
                ForgotPasswordRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string", format: "email", example: "vishal@example.com" }
                    }
                },
                VerifyOtpRequest: {
                    type: "object",
                    required: ["email", "otp"],
                    properties: {
                        email: { type: "string", format: "email", example: "vishal@example.com" },
                        otp: { type: "string", example: "583921" }
                    }
                },
                ResetPasswordRequest: {
                    type: "object",
                    required: ["email", "otp", "newPassword"],
                    properties: {
                        email: { type: "string", format: "email", example: "vishal@example.com" },
                        otp: { type: "string", example: "583921" },
                        newPassword: { type: "string", format: "password", example: "NewStrongPass@456" }
                    }
                },
                KycSubmitRequest: {
                    type: "object",
                    required: ["documentType", "documentNumber"],
                    properties: {
                        documentType: { type: "string", example: "PAN" },
                        documentNumber: { type: "string", example: "ABCDE1234F" }
                    }
                },
                KycStatusResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        status: {
                            type: "string",
                            enum: ["pending", "approved", "rejected"],
                            example: "pending"
                        },
                        remarks: { type: "string", example: "Under review" }
                    }
                },
                KycRecord: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                        userId: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
                        documentType: { type: "string", example: "PAN" },
                        documentNumber: { type: "string", example: "ABCDE1234F" },
                        status: {
                            type: "string",
                            enum: ["pending", "approved", "rejected"],
                            example: "pending"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-06-10T09:22:11.000Z"
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: "Authentication",
                description: "Registration, login, logout, and OTP-based password reset"
            },
            {
                name: "KYC",
                description: "KYC submission and status lookup for end users"
            },
            {
                name: "Admin",
                description: "Admin-only KYC review and approval workflows"
            }
        ]
    },

    // Using an absolute path (relative to this file) instead of "./routes/*.js"
    // so the glob resolves correctly no matter which directory the app is
    // started from. Adjust "../routes" if swagger.js does not sit one level
    // above the routes folder in your project.
    apis: [path.join(__dirname, "../routes/*.js")]
};

module.exports = swaggerJsDoc(options);