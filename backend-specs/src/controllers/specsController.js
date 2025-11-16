const {
  getManufacturerModelCombinations,
  getVehicleDetails,
  getDistinctManufacturers,
  getDistinctModels,
  getDistinctBodyClasses,
  getDistinctDataSources,
  getYearRange,
} = require('../services/elasticsearchService');

/**
 * Controller for manufacturer-model combinations endpoint
 * GET /api/specs/v1/manufacturer-model-combinations
 */
async function getManufacturerModelCombinationsHandler(req, res, next) {
  try {
    // Extract query parameters
    const { page = 1, size = 50, search = '', manufacturer = null } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);

    if (pageNum < 1 || sizeNum < 1 || sizeNum > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        message: 'page must be >= 1, size must be between 1 and 100',
      });
    }

    // Call service to get data
    const result = await getManufacturerModelCombinations({
      page: pageNum,
      size: sizeNum,
      search,
      manufacturer,
    });

    // Return successful response
    res.json(result);
  } catch (error) {
    console.error('Controller error:', error);
    next(error); // Pass to error handling middleware
  }
}

/**
 * Controller for vehicle details endpoint
 * GET /api/specs/v1/vehicles/details
 *
 * Query parameters:
 *   - models: Comma-separated manufacturer:model pairs (optional, e.g., "Ford:F-150,Chevrolet:Corvette")
 *             If omitted, returns all vehicles (filtered by other criteria)
 *   - page: Page number (default: 1)
 *   - size: Results per page (default: 20, max: 100)
 *   - manufacturer: Filter by manufacturer (optional)
 *   - model: Filter by model (optional)
 *   - yearMin: Filter by minimum year (optional)
 *   - yearMax: Filter by maximum year (optional)
 *   - bodyClass: Filter by body class (optional)
 *   - dataSource: Filter by data source (optional)
 *   - sortBy: Field to sort by (optional: manufacturer, model, year, body_class, data_source)
 *   - sortOrder: Sort order (optional: asc, desc; default: asc)
 */
async function getVehicleDetailsHandler(req, res, next) {
  try {
    // Extract and validate query parameters
    const {
      models = '',
      page = 1,
      size = 20,
      // Pattern 2: Field-specific search parameters (table column filters - partial matching)
      manufacturerSearch = '',
      modelSearch = '',
      bodyClassSearch = '',
      dataSourceSearch = '',
      // Query Control filters (exact matching)
      manufacturer = '',
      model = '',
      yearMin = '',
      yearMax = '',
      bodyClass = '',
      dataSource = '',
      // Highlight parameters (h_ prefix) - for segmented statistics
      h_yearMin = '',
      h_yearMax = '',
      h_manufacturer = '',
      h_modelCombos = '',
      h_bodyClass = '',
      sortBy = '',
      sortOrder = 'asc',
    } = req.query;

    // Parse models parameter into array of {manufacturer, model} objects (optional)
    let modelCombos = [];
    if (models && models.trim() !== '') {
      modelCombos = models.split(',').map((combo) => {
        const [mfr, mdl] = combo.split(':');

        if (!mfr || !mdl) {
          throw new Error(
            `Invalid model format: "${combo}". Expected format: "Manufacturer:Model"`
          );
        }

        return {
          manufacturer: mfr.trim(),
          model: mdl.trim(),
        };
      });
    }
    // If no models specified, will return all vehicles (filtered by other criteria)

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);

    if (pageNum < 1 || sizeNum < 1 || sizeNum > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        message: 'page must be >= 1, size must be between 1 and 100',
      });
    }

    // Validate sort parameters
    const validSortFields = [
      'manufacturer',
      'model',
      'year',
      'body_class',
      'data_source',
      'vehicle_id',
      'instance_count',  // Allowed but ignored (computed field)
    ];
    if (sortBy && !validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: 'Invalid sort parameter',
        message: `sortBy must be one of: ${validSortFields.join(', ')}`,
      });
    }

    // instance_count is computed after main query, so ignore it for ES sorting
    const actualSortBy = sortBy === 'instance_count' ? null : sortBy;

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({
        error: 'Invalid sort order',
        message: 'sortOrder must be either "asc" or "desc"',
      });
    }

    // Build filters object
    const filters = {};

    // Pattern 2: Field-specific search parameters (table column filters - partial matching)
    if (manufacturerSearch) filters.manufacturerSearch = manufacturerSearch.trim();
    if (modelSearch) filters.modelSearch = modelSearch.trim();
    if (bodyClassSearch) filters.bodyClassSearch = bodyClassSearch.trim();
    if (dataSourceSearch) filters.dataSourceSearch = dataSourceSearch.trim();

    // Query Control filters (exact matching)
    if (manufacturer) filters.manufacturer = manufacturer.trim();
    if (model) filters.model = model.trim();
    if (yearMin) filters.yearMin = parseInt(yearMin);
    if (yearMax) filters.yearMax = parseInt(yearMax);
    if (bodyClass) filters.bodyClass = bodyClass.trim();
    if (dataSource) filters.dataSource = dataSource.trim();

    // Build highlights object (for segmented statistics)
    const highlights = {};
    if (h_yearMin) highlights.yearMin = parseInt(h_yearMin);
    if (h_yearMax) highlights.yearMax = parseInt(h_yearMax);
    if (h_manufacturer) highlights.manufacturer = h_manufacturer.trim();

    // Parse h_modelCombos (format: "Dodge:Charger,Chevrolet:Camaro")
    if (h_modelCombos && h_modelCombos.trim() !== '') {
      highlights.modelCombos = h_modelCombos.split(',').map((combo) => {
        const [mfr, mdl] = combo.split(':');
        if (!mfr || !mdl) {
          throw new Error(
            `Invalid h_modelCombos format: "${combo}". Expected format: "Manufacturer:Model"`
          );
        }
        return {
          manufacturer: mfr.trim(),
          model: mdl.trim(),
        };
      });
    }

    if (h_bodyClass) highlights.bodyClass = h_bodyClass.trim();

    // Call service to get vehicle details
    const result = await getVehicleDetails({
      modelCombos,
      page: pageNum,
      size: sizeNum,
      filters,
      highlights,  // NEW: Pass highlights to service
      sortBy: actualSortBy || null,  // Use actualSortBy (null if instance_count)
      sortOrder: sortOrder || 'asc',
    });

    // Return successful response
    res.json(result);
  } catch (error) {
    console.error('Vehicle details controller error:', error);

    // Handle specific error types
    if (error.message.includes('Invalid model format')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }

    next(error); // Pass to error handling middleware
  }
}

/**
 * Unified controller for filter options endpoint
 * GET /api/specs/v1/filters/:fieldName
 *
 * Query parameters:
 *   - search: Optional search term for filtering results (currently supported for manufacturers)
 *   - limit: Optional limit for number of results (default: 1000)
 *
 * Routes to appropriate service function based on fieldName parameter
 */
async function getFilterOptionsHandler(req, res, next) {
  try {
    const { fieldName } = req.params;
    const { search = '', limit = 1000 } = req.query;

    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (limitNum < 1 || limitNum > 5000) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        message: 'limit must be between 1 and 5000',
      });
    }

    // Route to appropriate service function
    switch (fieldName) {
      case 'manufacturers': {
        const manufacturers = await getDistinctManufacturers(search, limitNum);
        return res.json({ manufacturers });
      }

      case 'models': {
        const models = await getDistinctModels(search, limitNum);
        return res.json({ models });
      }

      case 'body-classes': {
        const body_classes = await getDistinctBodyClasses();
        return res.json({ body_classes });
      }

      case 'data-sources': {
        const data_sources = await getDistinctDataSources();
        return res.json({ data_sources });
      }

      case 'year-range': {
        const year_range = await getYearRange();
        return res.json(year_range);
      }

      default:
        return res.status(400).json({
          error: 'Invalid field name',
          message: `Field "${fieldName}" is not supported. Valid fields: manufacturers, models, body-classes, data-sources, year-range`,
        });
    }
  } catch (error) {
    console.error(`Error fetching filter options for ${req.params.fieldName}:`, error);
    next(error);
  }
}

module.exports = {
  getManufacturerModelCombinationsHandler,
  getVehicleDetailsHandler,
  getFilterOptionsHandler,
};
