/**
 * Controller for ALL VINs endpoint (browse all VINs)
 * GET /api/vins/v1/vins
 *
 * Query Parameters:
 *   - page: Page number (1-indexed, default: 1)
 *   - size: Number of results per page (default: 20, max: 100)
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
async function getAllVinsHandler(req, res, next) {
  try {
    const {
      page = 1,
      size = 20,
      manufacturer,
      model,
      yearMin,
      yearMax,
      bodyClass,
      mileageMin,
      mileageMax,
      valueMin,
      valueMax,
      vin,
      conditionDescription,
      registeredState,
      exteriorColor,
      sortBy = 'vin',
      sortOrder = 'asc'
    } = req.query;

    // Validate and parse parameters
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);

    if (pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'page must be >= 1',
      });
    }

    if (sizeNum < 1 || sizeNum > 100) {
      return res.status(400).json({
        error: 'Invalid size parameter',
        message: 'size must be between 1 and 100',
      });
    }

    // Calculate offset for pagination
    const from = (pageNum - 1) * sizeNum;

    // Build Elasticsearch query with filters
    const mustClauses = [];

    // Use case-insensitive wildcard queries for partial matching on keyword fields
    if (manufacturer) {
      mustClauses.push({
        wildcard: {
          manufacturer: {
            value: `*${manufacturer.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (model) {
      mustClauses.push({
        wildcard: {
          model: {
            value: `*${model.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (bodyClass) {
      mustClauses.push({
        wildcard: {
          body_class: {
            value: `*${bodyClass.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (vin) {
      mustClauses.push({
        wildcard: {
          vin: {
            value: `*${vin.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (conditionDescription) {
      mustClauses.push({
        wildcard: {
          condition_description: {
            value: `*${conditionDescription.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (registeredState) {
      mustClauses.push({
        wildcard: {
          registered_state: {
            value: `*${registeredState.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (exteriorColor) {
      mustClauses.push({
        wildcard: {
          exterior_color: {
            value: `*${exteriorColor.toLowerCase()}*`,
            case_insensitive: true
          }
        }
      });
    }

    if (yearMin || yearMax) {
      const rangeQuery = { range: { year: {} } };
      if (yearMin) rangeQuery.range.year.gte = parseInt(yearMin);
      if (yearMax) rangeQuery.range.year.lte = parseInt(yearMax);
      mustClauses.push(rangeQuery);
    }

    if (mileageMin || mileageMax) {
      const rangeQuery = { range: { mileage: {} } };
      if (mileageMin) rangeQuery.range.mileage.gte = parseInt(mileageMin);
      if (mileageMax) rangeQuery.range.mileage.lte = parseInt(mileageMax);
      mustClauses.push(rangeQuery);
    }

    if (valueMin || valueMax) {
      const rangeQuery = { range: { estimated_value: {} } };
      if (valueMin) rangeQuery.range.estimated_value.gte = parseInt(valueMin);
      if (valueMax) rangeQuery.range.estimated_value.lte = parseInt(valueMax);
      mustClauses.push(rangeQuery);
    }

    const query = mustClauses.length > 0
      ? { bool: { must: mustClauses } }
      : { match_all: {} };

    // Query VINs from autos-vins index
    const { esClient } = require('../config/elasticsearch');

    const response = await esClient.search({
      index: 'autos-vins',
      query: query,
      from: from,
      size: sizeNum,
      sort: [
        { [sortBy]: sortOrder }
      ]
    });

    // Get total count
    const totalCount = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total.value;

    // Extract instances from hits
    const instances = response.hits.hits.map(hit => hit._source);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / sizeNum);

    // Return response with pagination metadata
    res.json({
      total: totalCount,
      instances,
      pagination: {
        page: pageNum,
        size: sizeNum,
        totalPages: totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Controller error (getAllVins):', error);
    next(error);
  }
}

/**
 * Controller for vehicle-specific instances endpoint
 * GET /api/vins/v1/vehicles/:vehicleId/instances
 *
 * Query Parameters:
 *   - page: Page number (1-indexed, default: 1)
 *   - pageSize: Number of results per page (default: 20, max: 100)
 *
 * Queries VINs for a specific vehicle from autos-vins index
 */
async function getVehicleInstancesHandler(req, res, next) {
  try {
    const { vehicleId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    // Validate and parse parameters
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    if (pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page parameter',
        message: 'page must be >= 1',
      });
    }

    if (pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({
        error: 'Invalid pageSize parameter',
        message: 'pageSize must be between 1 and 100',
      });
    }

    // Calculate offset for pagination
    const from = (pageNum - 1) * pageSizeNum;

    // Query VINs from autos-vins index
    const { esClient } = require('../config/elasticsearch');

    const response = await esClient.search({
      index: 'autos-vins',
      query: {
        term: { vehicle_id: vehicleId },
      },
      from: from,
      size: pageSizeNum,
      sort: [
        { vin: 'asc' }  // Sort by VIN for consistent pagination
      ]
    });

    // Get total count for this vehicle (handle both number and object formats)
    const totalCount = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total.value;

    if (totalCount === 0) {
      return res.status(404).json({
        error: 'No VINs found',
        message: `No VIN instances found for vehicle ID: ${vehicleId}`,
      });
    }

    // Extract instances from hits
    const instances = response.hits.hits.map(hit => hit._source);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSizeNum);

    // Return response
    res.json({
      vehicle_id: vehicleId,
      instance_count: totalCount,  // Total VINs for this vehicle
      instances,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Controller error (instances):', error);
    next(error);
  }
}

module.exports = {
  getAllVinsHandler,
  getVehicleInstancesHandler,
};
