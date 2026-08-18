/**
 * Authentication Routes
 *
 * Maps authentication endpoints to controller actions.
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/login - Authenticate user and issue JWT
router.post("/login", authController.login);

module.exports = router;
