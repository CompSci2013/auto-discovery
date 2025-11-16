const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3002;
const SERVICE_NAME = process.env.SERVICE_NAME || 'auth-service';

// Middleware
app.use(cors());
app.use(express.json());

// Routes - mounted at /api/auth/v1
app.use('/api/auth/v1', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: `auto-discovery-${SERVICE_NAME}`,
    timestamp: new Date().toISOString()
  });
});

// Ready check endpoint (for Kubernetes readiness probe)
app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    service: `auto-discovery-${SERVICE_NAME}`,
    message: 'Auth service is ready to accept requests'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Auto Discovery Auth Service',
    service: SERVICE_NAME,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      login: 'POST /api/auth/v1/login',
      user: 'GET /api/auth/v1/user',
      verify: 'POST /api/auth/v1/verify',
      logout: 'POST /api/auth/v1/logout'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    service: SERVICE_NAME
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auto Discovery Auth Service listening on port ${PORT}`);
  console.log(`Service: ${SERVICE_NAME}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Ready check: http://localhost:${PORT}/ready`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/auth/v1/login`);
  console.log('');
  console.log('⚠️  BARE-BONES MODE: No validation - accepts all credentials');
  console.log('⚠️  Always returns: role=administrator, authenticated=true');
});
