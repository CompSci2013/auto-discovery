# INFRASTRUCTURE ANALYSIS
## Kubernetes & Elasticsearch Configuration
**Date**: 2025-11-16
**Purpose**: Document existing infrastructure to refine API specifications

---

## EXECUTIVE SUMMARY

This document details the **actual production infrastructure** discovered in the Kubernetes cluster, including Elasticsearch configuration, index structures, and data models. These findings will be used to refine API specifications and ensure the greenfield implementation aligns with the existing data architecture.

**Key Findings**:
- ✅ Elasticsearch 8.11.1 running in `data` namespace
- ✅ Two primary indices: `autos-unified` (4,887 vehicles), `autos-vins` (55,463 VINs)
- ✅ Backend API already functional with 5 endpoints
- ⚠️ Index naming mismatch: specs reference `autos-specifications`, actual is `autos-unified`
- ⚠️ Body class filter lacks counts (returns strings only, not `{value, count}` format)

---

## 1. KUBERNETES INFRASTRUCTURE

### 1.1 Namespaces

| Namespace | Purpose | Resources |
|-----------|---------|-----------|
| `data` | Data layer services | Elasticsearch pod, services |
| `autos` | Production vehicle platform (v1.6.4) | 2 backend pods, 2 frontend pods |
| `autos2` | Development/experimental platform | 2 backend pods, 2 frontend pods |

### 1.2 Elasticsearch Pod Configuration

**Namespace**: `data`
**Pod Name**: `elasticsearch-5889744874-xztvl`
**Node**: `thor` (192.168.0.244)
**Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.11.1`

**Resource Limits**:
```yaml
Limits:
  cpu: 2
  memory: 4Gi
Requests:
  cpu: 1
  memory: 3Gi
```

**Environment Variables**:
```yaml
discovery.type: single-node
xpack.security.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
ES_JAVA_OPTS: -Xms2g -Xmx2g
cluster.name: tle-cluster
node.name: elasticsearch-thor
bootstrap.memory_lock: false
indices.memory.index_buffer_size: 30%
```

**Volume**:
- PersistentVolumeClaim: `elasticsearch-data`
- Mount Path: `/usr/share/elasticsearch/data`

### 1.3 Elasticsearch Services

| Service Name | Type | Cluster IP | Port(s) | Purpose |
|--------------|------|------------|---------|---------|
| `elasticsearch` | ClusterIP | 10.43.133.216 | 9200/TCP, 9300/TCP | Internal cluster access |
| `elasticsearch-nodeport` | NodePort | 10.43.65.112 | 9200:30398/TCP | External access |

**Internal DNS**: `elasticsearch.data.svc.cluster.local:9200`

### 1.4 Cluster Health

```json
{
  "cluster_name": "tle-cluster",
  "status": "green",
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 44,
  "active_shards": 44,
  "active_shards_percent": 100.0
}
```

**Version**: 8.11.1
**Build Date**: 2023-11-11
**Lucene Version**: 9.8.0

---

## 2. BACKEND INFRASTRUCTURE

### 2.1 Backend Pod Configuration (autos namespace)

**Deployment**: `autos-backend`
**Replicas**: 2 (rolling update strategy)
**Image**: `localhost/autos-prime-ng-backend:v1.6.4`
**Pods**:
- `autos-backend-677864d498-6k5tb` (10.42.1.20)
- `autos-backend-677864d498-6wcxm` (10.42.1.21)

**Environment Variables**:
```yaml
ELASTICSEARCH_URL: http://elasticsearch.data.svc.cluster.local:9200
ELASTICSEARCH_INDEX: autos-unified  # ⚠️ NOT autos-specifications!
NODE_ENV: production
PORT: 3000
```

**Health Checks**:
- Liveness Probe: `GET /health` on port 3000
- Readiness Probe: Enabled

### 2.2 Services & Ingress

| Service | Type | Cluster IP | Port | Backends |
|---------|------|------------|------|----------|
| `autos-backend` | ClusterIP | 10.43.187.98 | 3000/TCP | 2 pods |
| `autos-frontend` | ClusterIP | 10.43.13.217 | 80/TCP | 2 pods |

**Ingress Configuration**:
```yaml
Host: autos.minilab
Rules:
  /api   → autos-backend:3000 (10.42.1.20, 10.42.1.21)
  /      → autos-frontend:80 (10.42.1.29, 10.42.1.27)
Ingress Class: traefik
Addresses: 192.168.0.110, 192.168.0.244
```

**Access URLs**:
- Frontend: `http://autos.minilab/`
- Backend API: `http://autos.minilab/api/v1/`

---

## 3. ELASTICSEARCH INDICES

### 3.1 Index Overview

```
health status index             pri rep docs.count docs.deleted store.size
green  open   autos-vins          1   0     55,463            0      8.7mb
green  open   autos-unified       1   0      4,887            0    536.4kb
green  open   transport-unified   1   0      4,607            0      2.1mb
green  open   vehicle-tracking    1   0          0            0       249b
```

### 3.2 `autos-unified` Index

**Purpose**: Vehicle specifications (manufacturer, model, year, body class, etc.)
**Documents**: 4,887 vehicle specifications
**Size**: 536.4 KB

#### Field Mapping

| Field | Type | Sub-fields | Notes |
|-------|------|------------|-------|
| `vehicle_id` | keyword | - | Primary key (e.g., `nhtsa-ford-crown-victoria-1953`) |
| `manufacturer` | text | `.keyword` | Searchable + exact match |
| `model` | text | `.keyword` | Searchable + exact match |
| `year` | integer | - | |
| `body_class` | keyword | - | Exact values only |
| `data_source` | keyword | - | Source system identifier |
| `body_style` | keyword | - | |
| `drive_type` | keyword | - | |
| `engine_cylinders` | integer | - | |
| `engine_displacement_l` | float | - | |
| `engine_hp` | integer | - | |
| `engine_type` | keyword | - | |
| `transmission_speeds` | integer | - | |
| `transmission_type` | keyword | - | |
| `ingested_at` | date | - | |
| `body_class_match_type` | text | `.keyword` | |
| `body_class_updated_at` | date | - | |
| `synthesis_date` | date | - | |
| `vin` | keyword | - | Optional (mostly null) |

#### Sample Document

```json
{
  "vehicle_id": "nhtsa-ford-crown-victoria-1953",
  "manufacturer": "Ford",
  "model": "Crown Victoria",
  "year": 1953,
  "body_class": "Sedan",
  "data_source": "nhtsa_vpic_large_sample",
  "ingested_at": "2025-10-12T23:22:19.933382",
  "body_class_match_type": "exact_match",
  "body_class_updated_at": "2025-11-02T07:32:25.127446"
}
```

#### Aggregation Statistics

**Manufacturers** (Top 10):
```
Chevrolet:   849 vehicles
Ford:        665 vehicles
Buick:       480 vehicles
Chrysler:    415 vehicles
Dodge:       390 vehicles
Cadillac:    361 vehicles
Pontiac:     326 vehicles
Lincoln:     307 vehicles
Jeep:        299 vehicles
GMC:         285 vehicles
```

**Total Manufacturers**: 71 (including small/custom manufacturers)

**Body Classes**:
```
Sedan:        2,615 vehicles (53.5%)
SUV:            998 vehicles (20.4%)
Coupe:          494 vehicles (10.1%)
Pickup:         290 vehicles (5.9%)
Van:            167 vehicles (3.4%)
Hatchback:      109 vehicles (2.2%)
Sports Car:     109 vehicles (2.2%)
Touring Car:     38 vehicles (0.8%)
Wagon:           38 vehicles (0.8%)
Convertible:     21 vehicles (0.4%)
Truck:            5 vehicles (0.1%)
Limousine:        3 vehicles (0.1%)
```

**Year Range**: 1908 to 2024 (116 years)

**Data Sources**:
```
synthetic_historical:          4,094 vehicles (83.8%)
nhtsa_vpic_large_sample:         793 vehicles (16.2%)
```

#### Manufacturer-Model Combinations (Sample)

```json
{ "manufacturer": "Buick", "model": "Century", "count": 71 },
{ "manufacturer": "Buick", "model": "LeSabre", "count": 48 },
{ "manufacturer": "Buick", "model": "Electra", "count": 33 },
{ "manufacturer": "Buick", "model": "Enclave", "count": 18 },
{ "manufacturer": "Buick", "model": "Encore", "count": 13 }
```

### 3.3 `autos-vins` Index

**Purpose**: Individual VIN records (vehicle instances)
**Documents**: 55,463 VIN records
**Size**: 8.7 MB

#### Field Mapping

| Field | Type | Sub-fields | Notes |
|-------|------|------------|-------|
| `vin` | keyword | - | Primary key (17-character VIN) |
| `vehicle_id` | keyword | - | FK to autos-unified |
| `manufacturer` | keyword | - | Denormalized |
| `model` | keyword | - | Denormalized |
| `year` | integer | - | Denormalized |
| `body_class` | keyword | - | Denormalized |
| `data_source` | text | `.keyword` | |
| `condition_rating` | integer | - | 1-5 scale |
| `condition_description` | keyword | - | Project/Fair/Good/Excellent/Concours |
| `mileage` | integer | - | Odometer reading |
| `mileage_verified` | boolean | - | |
| `registered_state` | keyword | - | US state code |
| `registration_status` | keyword | - | Active/Historic/etc. |
| `title_status` | keyword | - | Clean/Rebuilt/Salvage |
| `exterior_color` | text | `.keyword` | |
| `factory_options` | text | `.keyword` | Array of strings |
| `estimated_value` | integer | - | USD |
| `matching_numbers` | boolean | - | |
| `last_service_date` | date | - | Format: yyyy-MM-dd |

#### Sample Document

```json
{
  "vin": "1PLBP40E9CF100000",
  "manufacturer": "Plymouth",
  "model": "Horizon",
  "year": 1982,
  "body_class": "Hatchback",
  "vehicle_id": "synth-plymouth-horizon-1982",
  "condition_rating": 3,
  "condition_description": "Good",
  "mileage": 523377,
  "mileage_verified": true,
  "registered_state": "PA",
  "registration_status": "Active",
  "title_status": "Clean",
  "exterior_color": "Green Metallic",
  "factory_options": ["GT Equipment Group"],
  "estimated_value": 33715,
  "matching_numbers": true,
  "last_service_date": "2025-05-28"
}
```

---

## 4. BACKEND API ENDPOINTS

### 4.1 Implemented Endpoints

Based on [backend/src/routes/vehicleRoutes.js](../backend/src/routes/vehicleRoutes.js):

#### 1. Manufacturer-Model Combinations
```
GET /api/v1/manufacturer-model-combinations
```

**Query Parameters**:
- `page` (default: 1)
- `size` (default: 50, max: 100)
- `search` (searches manufacturer/model/body_class)
- `manufacturer` (filter by specific manufacturer)

**Response** (Client-Side Pagination):
```json
{
  "total": 150,
  "page": 1,
  "size": 50,
  "totalPages": 3,
  "data": [
    {
      "manufacturer": "Ford",
      "count": 665,
      "models": [
        { "model": "F-150", "count": 23 },
        { "model": "Mustang", "count": 18 }
      ]
    }
  ]
}
```

**Implementation**: Uses nested aggregations (manufacturer → models) with client-side pagination.

#### 2. Vehicle Details
```
GET /api/v1/vehicles/details
```

**Query Parameters**:
- `models` (comma-separated `Manufacturer:Model` pairs)
- `page`, `size` (pagination)
- `manufacturerSearch`, `modelSearch`, `bodyClassSearch`, `dataSourceSearch` (partial matching)
- `manufacturer`, `model`, `yearMin`, `yearMax`, `bodyClass`, `dataSource` (exact matching)
- `h_yearMin`, `h_yearMax`, `h_manufacturer`, `h_modelCombos`, `h_bodyClass` (highlight filters)
- `sortBy`, `sortOrder`

**Response** (Server-Side Pagination):
```json
{
  "total": 1234,
  "page": 1,
  "size": 20,
  "totalPages": 62,
  "query": { "modelCombos": [...], "filters": {...} },
  "results": [
    {
      "vehicle_id": "nhtsa-ford-f-150-2020",
      "manufacturer": "Ford",
      "model": "F-150",
      "year": 2020,
      "body_class": "Pickup",
      "data_source": "nhtsa_vpic_large_sample",
      "instance_count": 147  // ⭐ Joined from autos-vins
    }
  ],
  "statistics": {
    "byManufacturer": { "Ford": { "total": 523, "highlighted": 89 } },
    "modelsByManufacturer": { "Ford": { "F-150": { "total": 147, "highlighted": 45 } } },
    "byYearRange": { "2020": { "total": 234, "highlighted": 67 } },
    "byBodyClass": { "Pickup": { "total": 290, "highlighted": 89 } },
    "totalCount": 1234
  }
}
```

**Implementation**:
- Server-side pagination with Elasticsearch
- Joins `autos-unified` with `autos-vins` to get instance counts
- Supports segmented statistics (highlighted vs. total)

#### 3. Filter Options
```
GET /api/v1/filters/:fieldName
```

**Supported Fields**:
- `manufacturers` → `{ manufacturers: string[] }`
- `models` → `{ models: string[] }`
- `body-classes` → `{ body_classes: string[] }`  ⚠️ **No counts!**
- `data-sources` → `{ data_sources: string[] }`
- `year-range` → `{ min: 1908, max: 2024 }`

**Query Parameters**:
- `search` (optional, prefix matching)
- `limit` (default: 1000, max: 5000)

**⚠️ Issue**: Body classes endpoint returns only string array, not `{ value, count }` format expected by MVP picker.

#### 4. All VINs
```
GET /api/v1/vins
```

**Query Parameters**:
- `page`, `size` (pagination)
- Filters: `manufacturer`, `model`, `yearMin`, `yearMax`, `bodyClass`, `mileageMin`, `mileageMax`, `valueMin`, `valueMax`, `vin`, `conditionDescription`, `registeredState`, `exteriorColor`
- `sortBy`, `sortOrder`

**Response**:
```json
{
  "total": 55463,
  "instances": [...],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalPages": 2774,
    "hasMore": true
  }
}
```

#### 5. Vehicle-Specific VINs
```
GET /api/v1/vehicles/:vehicleId/instances
```

**Query Parameters**:
- `page`, `pageSize`

**Response**:
```json
{
  "vehicle_id": "nhtsa-ford-f-150-2020",
  "instance_count": 147,
  "instances": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## 5. SPECIFICATION GAPS & RECOMMENDATIONS

### 5.1 Index Naming Mismatch

**Issue**: Specifications reference `autos-specifications` index, but actual production uses `autos-unified`.

**Recommendations**:
1. ✅ **Update backend ENV**: Change `ELASTICSEARCH_INDEX=autos-specifications` to `ELASTICSEARCH_INDEX=autos-unified`
2. ✅ **Update specs**: Replace all references to `autos-specifications` with `autos-unified`
3. 🤔 **Consider**: Rename index to `autos-specifications` for consistency with naming conventions

**Decision**: Use `autos-unified` (production-proven, less risk).

### 5.2 Body Class Filter - Missing Counts

**Issue**: MVP spec expects body class filter to return `{ value: string, count: number }[]`, but actual API returns `string[]`.

**Current Implementation** (lines 621-643 in elasticsearchService.js):
```javascript
async function getDistinctBodyClasses() {
  const response = await esClient.search({
    index: ELASTICSEARCH_INDEX,
    size: 0,
    query: { match_all: {} },
    aggs: {
      body_classes: {
        terms: {
          field: 'body_class',
          size: 100,
          order: { _key: 'asc' }
        }
      }
    }
  });

  return response.aggregations.body_classes.buckets.map((bucket) => bucket.key);
}
```

**Recommendation**: Update function to return counts:

```javascript
async function getDistinctBodyClasses() {
  const response = await esClient.search({
    index: ELASTICSEARCH_INDEX,
    size: 0,
    query: { match_all: {} },
    aggs: {
      body_classes: {
        terms: {
          field: 'body_class',
          size: 100,
          order: { _key: 'asc' }
        }
      }
    }
  });

  return response.aggregations.body_classes.buckets.map((bucket) => ({
    value: bucket.key,
    count: bucket.doc_count
  }));
}
```

**Controller Update** (line 554 in vehicleController.js):
```javascript
case 'body-classes': {
  const data = await getDistinctBodyClasses();
  return res.json({
    success: true,
    data: data  // Now returns [{ value, count }]
  });
}
```

### 5.3 Manufacturer-Model API Response Format

**Issue**: MVP spec expects flat list with server-side pagination. Actual API returns nested structure with client-side pagination.

**Current Response**:
```json
{
  "data": [
    {
      "manufacturer": "Ford",
      "count": 665,
      "models": [
        { "model": "F-150", "count": 23 }
      ]
    }
  ]
}
```

**MVP Spec Expects**:
```json
{
  "results": [
    { "manufacturer": "Ford", "model": "F-150", "count": 23 },
    { "manufacturer": "Ford", "model": "Mustang", "count": 18 }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

**Recommendation**: Create new endpoint for MVP picker or add `?format=flat` parameter.

**New Endpoint**:
```
GET /api/v1/manufacturer-model-combinations-flat
```

**Implementation** (add to elasticsearchService.js):
```javascript
async function getManufacturerModelCombinationsFlat(options = {}) {
  const { page = 1, size = 20, search = '' } = options;

  const query = search ? {
    bool: {
      should: [
        { match: { manufacturer: { query: search, fuzziness: 'AUTO' } } },
        { match: { model: { query: search, fuzziness: 'AUTO' } } }
      ],
      minimum_should_match: 1
    }
  } : { match_all: {} };

  const response = await esClient.search({
    index: ELASTICSEARCH_INDEX,
    size: 0,
    query: query,
    aggs: {
      combos: {
        composite: {
          size: 10000,  // Get all, paginate in-memory
          sources: [
            { manufacturer: { terms: { field: 'manufacturer.keyword' } } },
            { model: { terms: { field: 'model.keyword' } } }
          ]
        }
      }
    }
  });

  const allCombos = response.aggregations.combos.buckets.map(b => ({
    manufacturer: b.key.manufacturer,
    model: b.key.model,
    count: b.doc_count
  }));

  const start = (page - 1) * size;
  const end = start + size;

  return {
    results: allCombos.slice(start, end),
    total: allCombos.length,
    page: parseInt(page),
    totalPages: Math.ceil(allCombos.length / size)
  };
}
```

### 5.4 API Contracts Specification - Needs Expansion

**Current State**: `specs/02-api-contracts-data-models.md` is only 837 bytes and marked as "⚠️ Needs expansion".

**Recommendation**: Expand spec to include:
1. Complete field mappings for both indices
2. All 5 API endpoints with examples
3. Response format documentation
4. Error response formats
5. Pagination strategy (server vs. client)
6. Aggregation patterns
7. Join patterns (autos-unified + autos-vins)

---

## 6. MVP IMPLEMENTATION GUIDANCE

### 6.1 For Single-Selection Picker (Body Class)

**Option 1: Update Backend** (Recommended for Production)
- Modify `getDistinctBodyClasses()` to return `{ value, count }`
- Update controller to wrap in `{ success: true, data: [...] }`
- Benefits: Accurate counts, consistent API design

**Option 2: Use Mock Interceptor** (Recommended for MVP)
- Use mock data from MVP-QUICK-START.md
- Benefits: Faster MVP validation, no backend changes
- Drawback: Not using real data

**Option 3: Update Picker Config**
- Modify `responseTransformer` to work with string array
- Set all counts to 0 or query separately
- Drawback: Inconsistent with spec, poor UX

### 6.2 For Dual-Hierarchy Picker (Manufacturer-Model)

**Current API is usable** but returns nested structure. Two options:

**Option 1: Create Flat Endpoint**
- Add `GET /api/v1/manufacturer-model-combinations-flat`
- Implements composite aggregation
- Server-side pagination
- ✅ Best for MVP

**Option 2: Transform in Frontend**
- Use existing nested endpoint
- Flatten in `responseTransformer`
- Client-side pagination
- ⚠️ May hit memory limits with large datasets

**Recommendation**: Implement Option 1 for production readiness.

---

## 7. CONFIGURATION UPDATES NEEDED

### 7.1 Specification Files to Update

1. **specs/02-api-contracts-data-models.md**
   - Expand from 837 B to comprehensive documentation
   - Document all 5 endpoints with examples
   - Include Elasticsearch mappings
   - Add aggregation patterns

2. **specs/03-discover-feature-specification.md**
   - Update index name: `autos-specifications` → `autos-unified`
   - Remove localStorage references

3. **specs/05-data-visualization-components.md**
   - Update index name
   - Remove localStorage references

4. **backend/.env** (or ConfigMap)
   - Ensure: `ELASTICSEARCH_INDEX=autos-unified`

5. **docs/MVP-PICKER-DEMO.md**
   - Update body class endpoint: `/api/v1/filters/bodyClass` → `/api/v1/filters/body-classes`
   - Document actual response format
   - Add option for mock vs. real API

### 7.2 Code Updates Needed

**Backend** ([backend/src/services/elasticsearchService.js](../backend/src/services/elasticsearchService.js)):

1. Add counts to `getDistinctBodyClasses()` (lines 621-643)
2. Add new function `getManufacturerModelCombinationsFlat()` for MVP picker
3. Export new function in module.exports

**Backend** ([backend/src/controllers/vehicleController.js](../backend/src/controllers/vehicleController.js)):

1. Update `body-classes` case in `getFilterOptionsHandler()` (line 554)
2. Add handler for flat endpoint (if implementing)

**Backend** ([backend/src/routes/vehicleRoutes.js](../backend/src/routes/vehicleRoutes.js)):

1. Add route for flat endpoint (if implementing)

---

## 8. SUMMARY & NEXT STEPS

### 8.1 What We Learned

✅ **Infrastructure is Production-Ready**:
- Elasticsearch 8.11.1 cluster is healthy and performant
- Backend API has 5 functional endpoints
- Data quality is good (4,887 vehicles, 55,463 VINs)
- Kubernetes deployment is stable

⚠️ **Minor Adjustments Needed**:
- Index naming inconsistency (`autos-unified` vs. spec)
- Body class filter missing counts
- Manufacturer-model API returns nested, not flat
- API contracts spec needs expansion

### 8.2 Recommended Actions

**Immediate (for MVP)**:
1. Use mock API interceptor for MVP picker demo
2. Document infrastructure findings in specs
3. Update spec 02 with comprehensive API documentation

**Short-Term (Phase 1)**:
1. Update `getDistinctBodyClasses()` to return counts
2. Create flat manufacturer-model endpoint
3. Update all specs to reference `autos-unified`
4. Test greenfield frontend against production API

**Long-Term (Phase 2+)**:
1. Consider renaming index to `autos-specifications` for consistency
2. Implement authentication/authorization integration
3. Add user preferences backend
4. Full API contract testing suite

### 8.3 Decision Required

**Question for Product Owner/Architect**:

Should we:
- **A)** Keep `autos-unified` index name (production-proven, less risk)
- **B)** Rename to `autos-specifications` (matches specs, more consistent)

**Recommendation**: **Option A** (keep `autos-unified`) and update specs to match production.

---

## APPENDIX A: Quick Reference

### Connection Strings

**Elasticsearch (Internal)**:
```
http://elasticsearch.data.svc.cluster.local:9200
```

**Elasticsearch (External)**:
```
http://<node-ip>:30398
```

**Backend API (Internal)**:
```
http://autos-backend.autos.svc.cluster.local:3000
```

**Backend API (External)**:
```
http://autos.minilab/api/v1
```

### Common kubectl Commands

```bash
# Check Elasticsearch health
kubectl exec -n data elasticsearch-5889744874-xztvl -- \
  curl -s http://localhost:9200/_cluster/health?pretty

# List indices
kubectl exec -n data elasticsearch-5889744874-xztvl -- \
  curl -s http://localhost:9200/_cat/indices?v

# Query index
kubectl exec -n data elasticsearch-5889744874-xztvl -- \
  curl -s 'http://localhost:9200/autos-unified/_search?size=1&pretty'

# Check backend logs
kubectl logs -n autos -l app=autos-backend --tail=100

# Restart backend
kubectl rollout restart deployment/autos-backend -n autos
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Author**: Infrastructure Analysis Task
