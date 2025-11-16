const express = require('express');
const router = express.Router();
const {
  getAllVinsHandler,
  getVehicleInstancesHandler,
} = require('../controllers/vinsController');

/**
 * GET /api/vins/v1/vins
 * Returns all VINs with pagination, filtering, and sorting
 *
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - size: Results per page (default: 20, max: 100)
 *   - manufacturer: Filter by manufacturer
 *   - model: Filter by model
 *   - yearMin: Minimum year
 *   - yearMax: Maximum year
 *   - bodyClass: Filter by body class
 *   - mileageMin: Minimum mileage
 *   - mileageMax: Maximum mileage
 *   - valueMin: Minimum estimated value
 *   - valueMax: Maximum estimated value
 *   - vin: Filter by VIN (partial match)
 *   - conditionDescription: Filter by condition description
 *   - registeredState: Filter by registered state
 *   - exteriorColor: Filter by exterior color
 *   - sortBy: Field to sort by (default: vin)
 *   - sortOrder: Sort order (asc/desc, default: asc)
 */
router.get('/vins', getAllVinsHandler);

/**
 * GET /api/vins/v1/vehicles/:vehicleId/instances
 * Returns VINs for a specific vehicle specification
 *
 * Path parameters:
 *   - vehicleId: Vehicle specification ID (e.g., nhtsa-ford-mustang-1967)
 *
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - pageSize: Results per page (default: 20, max: 100)
 */
router.get('/vehicles/:vehicleId/instances', getVehicleInstancesHandler);

module.exports = router;
