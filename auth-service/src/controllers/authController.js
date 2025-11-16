const jwt = require('jsonwebtoken');

// Mock secret key (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'auto-discovery-dev-secret-key';

/**
 * Login endpoint - accepts any credentials and returns admin token
 * POST /api/auth/v1/login
 *
 * Body: { username: string, password: string }
 * Returns: { success: true, token: string, user: {...} }
 */
async function loginHandler(req, res) {
  try {
    const { username, password } = req.body;

    // Bare-bones implementation - accept any credentials
    // In production, this would validate against a database

    // Create mock admin user
    const user = {
      id: 'admin-001',
      username: username || 'admin',
      email: 'admin@auto-discovery.local',
      role: 'administrator',
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: new Date().toISOString()
    };

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      user: user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
}

/**
 * Get current user endpoint
 * GET /api/auth/v1/user
 *
 * Headers: Authorization: Bearer <token>
 * Returns: { success: true, user: {...} }
 */
async function getUserHandler(req, res) {
  try {
    // Bare-bones implementation - always return admin user
    // In production, this would decode token and fetch user from database

    const user = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@auto-discovery.local',
      role: 'administrator',
      permissions: ['read', 'write', 'delete', 'admin'],
      authenticated: true
    };

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: error.message
    });
  }
}

/**
 * Verify token endpoint
 * POST /api/auth/v1/verify
 *
 * Body: { token: string }
 * Returns: { valid: true, user: {...} }
 */
async function verifyTokenHandler(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: 'No token provided'
      });
    }

    // Bare-bones implementation - accept any token
    // In production, this would actually verify the JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      res.json({
        valid: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          authenticated: true
        }
      });
    } catch (jwtError) {
      // For bare-bones, even if JWT is invalid, return success
      res.json({
        valid: true,
        user: {
          id: 'admin-001',
          username: 'admin',
          role: 'administrator',
          authenticated: true
        }
      });
    }

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      valid: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
}

/**
 * Logout endpoint
 * POST /api/auth/v1/logout
 *
 * Returns: { success: true }
 */
async function logoutHandler(req, res) {
  try {
    // Bare-bones implementation - just return success
    // In production with JWT, logout would invalidate the token (using a blacklist or Redis)

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
}

module.exports = {
  loginHandler,
  getUserHandler,
  verifyTokenHandler,
  logoutHandler
};
