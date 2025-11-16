const express = require('express');
const router = express.Router();
const {
  getManufacturerModelCombinationsHandler,
  getVehicleDetailsHandler,
  getFilterOptionsHandler,
} = require('../controllers/specsController');

/**
 * GET /api/specs/v1/manufacturer-model-combinations
 * Returns aggregated manufacturer-model data from Elasticsearch
 *
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - size: Results per page (default: 50, max: 100)
 *   - search: Search term for manufacturer/model/body_class
 *   - manufacturer: Filter by specific manufacturer
 */
router.get('/manufacturer-model-combinations', getManufacturerModelCombinationsHandler);

/**
 * GET /api/specs/v1/vehicles/details
 * Returns paginated vehicle specification records based on selected models
 *
 * Query parameters:
 *   - models: Comma-separated manufacturer:model pairs (e.g., Ford:F-150,Chevrolet:Corvette)
 *   - page: Page number (default: 1)
 *   - size: Results per page (default: 20, max: 100)
 *   - manufacturerSearch: Partial match on manufacturer field only (table column filter)
 *   - modelSearch: Partial match on model field only (table column filter)
 *   - bodyClassSearch: Partial match on body_class field only (table column filter)
 *   - dataSourceSearch: Partial match on data_source field only (table column filter)
 *   - manufacturer: Exact match on manufacturer field (Query Control filter)
 *   - model: Exact match on model field (Query Control filter)
 *   - yearMin: Minimum year filter
 *   - yearMax: Maximum year filter
 *   - bodyClass: Exact match on body_class field (Query Control filter)
 *   - dataSource: Exact match on data_source field (Query Control filter)
 *   - sortBy: Field to sort by
 *   - sortOrder: Sort order (asc/desc)
 */
router.get('/vehicles/details', getVehicleDetailsHandler);

/**
 * GET /api/specs/v1/filters/:fieldName
 * Returns distinct values for the specified filter field
 *
 * Path parameters:
 *   - fieldName: manufacturers, models, body-classes, data-sources, or year-range
 *
 * Response format varies by field:
 *   - manufacturers: { manufacturers: string[] }
 *   - models: { models: string[] }
 *   - body-classes: { body_classes: string[] }
 *   - data-sources: { data_sources: string[] }
 *   - year-range: { min: number, max: number }
 */
router.get('/filters/:fieldName', getFilterOptionsHandler);

module.exports = router;
