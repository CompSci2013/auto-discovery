const express = require('express');
const cors = require('cors');
require('dotenv').config();

const vinsRoutes = require('./routes/vinsRoutes');
const { testConnection } = require('./config/elasticsearch');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'vins-api';

// Middleware
app.use(cors());
app.use(express.json());

// Routes - mounted at /api/vins/v1
app.use('/api/vins/v1', vinsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: `auto-discovery-${SERVICE_NAME}`,
    timestamp: new Date().toISOString(),
    index: process.env.ELASTICSEARCH_INDEX || 'unknown'
  });
});

// Ready check endpoint (for Kubernetes readiness probe)
app.get('/ready', async (req, res) => {
  try {
    const { esClient } = require('./config/elasticsearch');
    await esClient.ping();
    res.json({
      status: 'ready',
      service: `auto-discovery-${SERVICE_NAME}`,
      elasticsearch: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      service: `auto-discovery-${SERVICE_NAME}`,
      elasticsearch: 'disconnected',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Auto Discovery VINs API',
    service: SERVICE_NAME,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      vins: '/api/vins/v1/vins',
      vehicleInstances: '/api/vins/v1/vehicles/:vehicleId/instances'
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

// Start server with Elasticsearch connection test
async function startServer() {
  try {
    // Test Elasticsearch connection
    await testConnection();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Auto Discovery VINs API listening on port ${PORT}`);
      console.log(`Service: ${SERVICE_NAME}`);
      console.log(`Elasticsearch Index: ${process.env.ELASTICSEARCH_INDEX || 'autos-vins'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Ready check: http://localhost:${PORT}/ready`);
      console.log(`API endpoint: http://localhost:${PORT}/api/vins/v1/vins`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
