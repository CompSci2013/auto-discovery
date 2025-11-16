const express = require('express');
const cors = require('cors');
require('dotenv').config();

const specsRoutes = require('./routes/specsRoutes');
const { testConnection } = require('./config/elasticsearch');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'specs-api';

// Middleware
app.use(cors());
app.use(express.json());

// Routes - mounted at /api/specs/v1
app.use('/api/specs/v1', specsRoutes);

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
    message: 'Auto Discovery Specs API',
    service: SERVICE_NAME,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      ready: '/ready',
      manufacturerModelCombinations: '/api/specs/v1/manufacturer-model-combinations',
      vehicleDetails: '/api/specs/v1/vehicles/details',
      filters: '/api/specs/v1/filters/:fieldName'
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
      console.log(`Auto Discovery Specs API listening on port ${PORT}`);
      console.log(`Service: ${SERVICE_NAME}`);
      console.log(`Elasticsearch Index: ${process.env.ELASTICSEARCH_INDEX || 'autos-unified'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Ready check: http://localhost:${PORT}/ready`);
      console.log(`API endpoint: http://localhost:${PORT}/api/specs/v1/manufacturer-model-combinations`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
