const express = require('express');
const router = express.Router();
const {
  loginHandler,
  getUserHandler,
  verifyTokenHandler,
  logoutHandler
} = require('../controllers/authController');

/**
 * POST /api/auth/v1/login
 * Authenticate user and return JWT token
 *
 * Body: { username: string, password: string }
 * Returns: { success: true, token: string, user: {...} }
 */
router.post('/login', loginHandler);

/**
 * GET /api/auth/v1/user
 * Get current authenticated user information
 *
 * Headers: Authorization: Bearer <token> (optional for bare-bones)
 * Returns: { success: true, user: {...} }
 */
router.get('/user', getUserHandler);

/**
 * POST /api/auth/v1/verify
 * Verify JWT token validity
 *
 * Body: { token: string }
 * Returns: { valid: true, user: {...} }
 */
router.post('/verify', verifyTokenHandler);

/**
 * POST /api/auth/v1/logout
 * Logout current user
 *
 * Returns: { success: true }
 */
router.post('/logout', logoutHandler);

module.exports = router;
