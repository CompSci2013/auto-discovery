# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Auto Discovery** is a greenfield Angular 14 application for browsing and analyzing automotive vehicle data, built **entirely from specifications** without reference to original source code. Uses PrimeNG 14.2+ UI library, Plotly.js for charts, and a specification-driven architecture with URL-first state management.

**Key Principle**: All implementation decisions come from specifications in `specs/` directory. Never reference original source code.

---

## Common Commands

**⚠️ IMPORTANT**: All development commands are run **INSIDE the development container**. Do not run these commands on the host machine.

### Container Management (Host Machine)

```bash
# Start development container (run from host)
cd /home/odin/projects/auto-discovery
podman run -d --name auto-discovery-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  localhost/auto-discovery-frontend:dev

# Check if container is running
podman ps | grep auto-discovery-dev

# Enter container for development
podman exec -it auto-discovery-dev sh

# OR run single commands in container
podman exec -it auto-discovery-dev npm start

# Stop and remove container when done
podman stop auto-discovery-dev
podman rm auto-discovery-dev
```

### Development (Inside Container)

**First, exec into container**: `podman exec -it auto-discovery-dev sh`

Then run these commands inside the container:

```bash
npm start              # Start dev server at http://localhost:4200
ng serve               # Alternative to npm start
ng serve --host 0.0.0.0 --port 4200  # Bind to all interfaces (required for container)
```

### Building (Inside Container)

```bash
npm run build          # Production build (outputs to dist/frontend)
npm run watch          # Development build with watch mode
ng build               # Direct Angular CLI build
ng build --configuration production  # With bundle budgets
```

### Testing (Inside Container)

```bash
npm test               # Run unit tests via Karma
npm run test:coverage  # Run tests with coverage report
npm run e2e            # Run Playwright E2E tests
npm run e2e:ui         # Run E2E tests in UI mode
npm run e2e:smoke      # Run smoke tests only

# Run specific test file
ng test --include='**/url-state.service.spec.ts'
```

### Code Generation (Inside Container)

```bash
ng generate service core/services/service-name
ng generate component features/discover/component-name
ng generate interface shared/models/model-name
ng generate guard core/guards/guard-name
```

### Docker Production Build (Host Machine)

```bash
# Build production image (from host)
cd /home/odin/projects/auto-discovery
docker build -f docs/Dockerfile -t auto-discovery-frontend:prod .

# OR with Podman
podman build -f docs/Dockerfile -t localhost/auto-discovery-frontend:prod .

# Run production container
podman run -d -p 8080:80 --name auto-discovery-prod \
  localhost/auto-discovery-frontend:prod
```

---

## Architecture

### Specification-Driven Development

**Rule #1**: Read specifications before coding
**Rule #2**: Specifications are source of truth (not original code)
**Rule #3**: Document deviations with justification

### Core Structure

```
src/app/
├── core/                    # Singleton services (state, HTTP, routing)
│   ├── services/
│   │   ├── url-state.service.ts           # URL parameter management (434 lines)
│   │   ├── request-coordinator.service.ts  # Cache, dedup, retry (265 lines)
│   │   ├── filter-url-mapper.service.ts    # Filter serialization
│   │   └── resource-management.service.ts  # Generic state (660 lines)
│   ├── interceptors/
│   │   └── error.interceptor.ts            # Centralized error handling
│   └── guards/
│       └── auth.guard.ts                   # Route protection
│
├── features/                # Feature modules (lazy loaded)
│   ├── discover/            # Main discovery page (7 panels)
│   │   ├── discover.component.ts
│   │   ├── discover.component.html
│   │   └── discover.module.ts
│   └── panel-popout/        # Pop-out window container
│       └── panel-popout.component.ts
│
├── shared/                  # Reusable components, pipes, directives
│   ├── components/
│   │   ├── base-data-table/         # Generic table component
│   │   ├── base-chart/              # Chart composition pattern
│   │   ├── base-picker/             # Configuration-driven picker
│   │   ├── column-manager/          # Drag-drop column management
│   │   └── dual-checkbox-picker/    # Tri-state hierarchical picker
│   ├── models/              # TypeScript interfaces
│   └── pipes/               # Shared pipes
│
├── app.module.ts            # Root module
└── app-routing.module.ts    # Routes
```

### Key Architectural Patterns

**1. URL-First State Management**

Specification: [04 - State Management](./specs/04-state-management-specification.md)

```typescript
// URL is single source of truth
// Pattern: URL → State → Components

// Update filters (syncs to URL, triggers data fetch)
this.vehicleState.updateFilters({
  manufacturer: 'Ford',
  yearMin: 2020
});

// Subscribe to state
this.vehicleState.state$.subscribe(state => {
  this.data = state.data;
  this.loading = state.loading;
});
```

**2. ResourceManagementService<TFilters, TData>**

Generic state management service (660 lines):

```typescript
// Manages: filters, data, loading, error, highlights
// Handles: URL sync, data fetching, caching, error recovery

constructor(
  private config: ResourceManagementConfig<TFilters, TData>
) {
  // Initialize from URL
  // Watch URL changes
  // Fetch data on filter changes
}

// Public API
public updateFilters(partial: Partial<TFilters>): void
public clearFilters(): void
public addHighlight(field: string, value: string): void
public getCurrentState(): ResourceState<TFilters, TData>
```

**3. Configuration-Driven Pickers**

Specification: [06 - Filter & Picker](./specs/06-filter-picker-components.md)

```typescript
// Define picker once, reuse everywhere
const MANUFACTURER_MODEL_PICKER: PickerConfig<ManufacturerModelRow> = {
  id: 'manufacturer-model',
  columns: [
    { key: 'manufacturer', label: 'Manufacturer', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'count', label: 'Count', sortable: true }
  ],
  api: {
    endpoint: '/api/specs/v1/manufacturer-model-combinations',
    method: 'GET',
    paginationMode: 'server',
    responseTransformer: (r) => ({ results: r.results, total: r.total })
  },
  row: {
    keyGenerator: (row) => `${row.manufacturer}|${row.model}`
  },
  selection: {
    mode: 'multiple',
    urlParam: 'modelCombos',
    serializer: (items) => items.map(i => `${i.manufacturer}:${i.model}`).join(','),
    deserializer: (url) => url.split(',').map(...)
  }
};

// Use in template
<app-base-picker [configId]="'manufacturer-model'"></app-base-picker>
```

**4. Pop-Out Window System**

Specification: [07 - Pop-Out Window System](./specs/07-popout-window-system.md)

```typescript
// MOVE semantics (panel disappears from main window)
// BroadcastChannel for cross-window messaging
// URL-first in pop-outs (each window watches its own URL)

// Open pop-out
popOutPanel(panelId: string): void {
  const url = `/panel/${gridId}/${panelId}/${type}`;
  const popoutWindow = window.open(url, `panel-${panelId}`, features);

  const channel = new BroadcastChannel(`panel-${panelId}`);
  channel.onmessage = (event) => this.handleMessage(event.data);

  // Monitor close with polling
  const checkInterval = setInterval(() => {
    if (popoutWindow.closed) {
      this.onPopOutClosed(panelId, channel, checkInterval);
    }
  }, 500);
}
```

**5. BaseDataTableComponent<T>**

Specification: [05 - Data Visualization](./specs/05-data-visualization-components.md)

Generic table with sorting, filtering, pagination:

```typescript
<app-base-data-table
  [tableId]="'vehicle-results'"
  [columns]="columns"
  [dataSource]="dataSource"
  [expandable]="true"
  (rowClick)="onRowClick($event)"
>
  <ng-template #cellTemplate let-column="column" let-row="row">
    <!-- Custom cell rendering -->
  </ng-template>
</app-base-data-table>
```

Features:
- OnPush change detection
- Column visibility management
- localStorage persistence
- Sorting, filtering, pagination
- Row expansion

**6. Chart Composition Pattern**

Specification: [05 - Data Visualization](./specs/05-data-visualization-components.md)

```typescript
// BaseChartComponent + ChartDataSource pattern
// Separates chart rendering from data transformation

abstract class ChartDataSource {
  abstract transform(
    statistics: VehicleStatistics,
    highlights: HighlightFilters,
    selectedValue: string | null,
    containerWidth: number
  ): ChartData | null;
}

// Concrete implementation
class ManufacturerChartDataSource extends ChartDataSource {
  transform(stats, highlights, selected, width): ChartData {
    return {
      data: [{
        type: 'bar',
        x: Object.keys(stats.manufacturerCounts),
        y: Object.values(stats.manufacturerCounts)
      }],
      layout: { /* Plotly layout */ }
    };
  }
}
```

---

## API Integration

**IMPORTANT**: The backend uses a **microservices architecture** with three independent services.

**Base URLs**: Configured in `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  specsApiUrl: 'http://auto-discovery.minilab/api/specs/v1',
  vinsApiUrl: 'http://auto-discovery.minilab/api/vins/v1',
  authApiUrl: 'http://auto-discovery.minilab/api/auth/v1'
};
```

**Specs API Endpoints** (`/api/specs/v1/*`):

Specification: [02 - API Contracts](./specs/02-api-contracts-data-models.md)

```typescript
GET /api/specs/v1/manufacturer-model-combinations?page=1&size=20
GET /api/specs/v1/vehicles/details?manufacturer=Ford&yearMin=2020
GET /api/specs/v1/filters/body-classes
GET /api/specs/v1/filters/manufacturers
GET /api/specs/v1/filters/models
```

**VINs API Endpoints** (`/api/vins/v1/*`):
```typescript
GET /api/vins/v1/vins?manufacturer=Ford
GET /api/vins/v1/vehicles/{vehicleId}/instances
```

**Auth Service Endpoints** (`/api/auth/v1/*`):
```typescript
POST /api/auth/v1/login
GET  /api/auth/v1/user
POST /api/auth/v1/verify
POST /api/auth/v1/logout
```

**Response Format**: Paginated with `results`, `total`, `page`, `size`, `totalPages`

---

## Testing

Specification: [09 - Testing Strategy](./specs/09-testing-strategy.md)

### Unit Tests (Karma + Jasmine)

```typescript
// Service testing
describe('UrlStateService', () => {
  it('should update query parameters', fakeAsync(() => {
    service.setQueryParams({ manufacturer: 'Ford' }).subscribe();
    tick();
    expect(router.url).toContain('manufacturer=Ford');
  }));
});

// Component testing
describe('DiscoverComponent', () => {
  it('should fetch data when filter added', () => {
    component.onFilterAdd({ type: 'manufacturer', value: 'Ford' });
    expect(mockStateService.updateFilters).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)

```typescript
// 7 test categories, ~50 tests total
test('should add manufacturer filter', async ({ page }) => {
  await page.goto('/discover?manufacturer=Ford');
  await expect(page).toHaveURL(/manufacturer=Ford/);
  const chipCount = await page.locator('.filter-chip').count();
  expect(chipCount).toBe(1);
});
```

### Coverage Targets
- Services: 80% minimum, 90% target
- Components: 70% minimum, 85% target
- Overall: 75% minimum, 85% target

---

## Important Implementation Details

### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush  // Required
})
export class MyComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  updateData(newData: any[]): void {
    this.data = newData;
    this.cdr.markForCheck();  // MUST call after mutation
  }
}
```

### Unsubscribe Pattern
```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.stateService.state$
    .pipe(takeUntil(this.destroy$))
    .subscribe(state => { /* ... */ });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Request Coordination

Specification: [04 - State Management](./specs/04-state-management-specification.md), section 6

- 3-layer processing: Cache → Deduplication → HTTP with retry
- 30-second cache TTL (configurable, default: 30000ms)
- Exponential backoff retry (3 attempts, delay doubles each retry)
- Request deduplication for concurrent calls
- Loading state management per request and global

### PrimeNG Components
```typescript
// Import specific modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

// Register icons
import { PrimeIcons } from 'primeng/api';
```

### BroadcastChannel API
```typescript
// Check browser support
if (typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('panel-id');
  channel.onmessage = (event) => { /* ... */ };
  channel.postMessage({ type: 'UPDATE', data: {} });
}
```

---

## Deployment

Specification: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md)

### Production Build

```bash
ng build --configuration production
```

**Bundle Budgets**:
- Initial: 5 MB warning, 10 MB error
- Component styles: 10 KB warning, 20 KB error

### Docker Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx Configuration

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Gzip compression
  gzip on;
  gzip_types text/css application/javascript application/json;
}
```

---

## Quality Standards

Specification: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md)

### Code Quality
- TypeScript strict mode: ✅ Required
- No `any` types: ✅ Required (except where explicitly needed)
- ESLint passing: ✅ Required
- Prettier formatted: ✅ Required
- JSDoc comments: ✅ Required for public APIs

### Performance
- Bundle size: < 5 MB target
- Initial load: < 3 seconds
- TTI: < 4 seconds
- 60 FPS animations

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all features
- Screen reader support
- 4.5:1 color contrast minimum

---

## Development Workflow

**⚠️ CONTAINER-BASED DEVELOPMENT**: All development work is done inside the development container. The frontend source code is volume-mounted from the host, so you can edit files on the host (VS Code, vim, etc.), but all Angular CLI commands, npm commands, and tests run inside the container.

**Host Machine** (Thor):
- Edit code (VS Code Remote-SSH, vim, etc.)
- Git operations (commit, push, pull)
- Container management (start, stop, exec)

**Development Container**:
- Angular CLI commands (`ng serve`, `ng generate`, etc.)
- npm commands (`npm start`, `npm test`, etc.)
- File compilation and hot module reloading

### 1. Read Specification
Always start by reading relevant spec in `specs/` directory.

### 2. Start Development Container

```bash
# On host machine
cd /home/odin/projects/auto-discovery
podman run -d --name auto-discovery-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  localhost/auto-discovery-frontend:dev

# Verify container is running
podman ps | grep auto-discovery-dev
```

### 3. Write Tests First (TDD)

**Inside container**:

```bash
# Enter container shell
podman exec -it auto-discovery-dev sh

# Create service (inside container)
ng generate service core/services/my-service

# Write tests in my-service.spec.ts (from spec examples)
# Run tests (inside container)
npm test -- --include='**/my-service.spec.ts'

# Implement service to pass tests
```

**OR run single command without shell**:

```bash
# From host, execute in container
podman exec -it auto-discovery-dev ng generate service core/services/my-service
podman exec -it auto-discovery-dev npm test -- --include='**/my-service.spec.ts'
```

### 4. Follow Specification Exactly
- Use exact method signatures
- Match behavior described
- Include code examples from specs

### 5. Document Deviations
```typescript
/**
 * SPEC DEVIATION: Using 5 retries instead of 3
 * Reason: API documentation recommends 5
 * Reference: https://api.example.com/docs
 * Issue: #42
 */
private maxRetries = 5;
```

### 6. Commit with Spec References

**On host machine** (git commands run on host, not in container):

```bash
git commit -m "feat(core): implement UrlStateService

Implements URL parameter management:
- setQueryParams() for updating URL
- getQueryParam() for reading params
- watchQueryParams() for observing changes

Ref: specs/04-state-management-specification.md section 2"
```

---

## Quick Reference

### Specifications
- **Index**: [specs/README.md](./specs/README.md)
- **Architecture**: [specs/01-architectural-analysis.md](./specs/01-architectural-analysis.md)
- **State**: [specs/04-state-management-specification.md](./specs/04-state-management-specification.md)
- **Components**: [specs/05-data-visualization-components.md](./specs/05-data-visualization-components.md)
- **Testing**: [specs/09-testing-strategy.md](./specs/09-testing-strategy.md)

### Key Services
- `UrlStateService` - URL parameter management (434 lines)
- `RequestCoordinatorService` - Cache, dedup, retry (265 lines)
- `FilterUrlMapperService` - Filter serialization
- `ResourceManagementService<T, D>` - Generic state (660 lines)
- `PopOutContextService` - Pop-out detection and messaging

### Key Components
- `BaseDataTableComponent<T>` - Generic table
- `BasePickerComponent<T>` - Configuration-driven picker
- `DualCheckboxPickerComponent` - Tri-state hierarchical picker
- `BaseChartComponent` - Chart composition
- `QueryControlComponent` - Filter dialogs
- `ColumnManagerComponent` - Drag-drop columns

---

**Remember**: This is a specification-driven project. Always consult specs before making implementation decisions.
