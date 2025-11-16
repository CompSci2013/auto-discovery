# Development Roadmap
## Auto Discovery - Implementation Plan

**Project**: Auto Discovery (Vehicle Discovery Platform)
**Approach**: Specification-Driven Development
**Timeline**: 10 weeks (estimated)
**Started**: 2025-11-15

**⚠️ DESIGN CHANGE (2025-11-15)**:
- **Angular Version**: Changed from Angular 18+ to **Angular 14**
- **Backend**: Integrated Node.js + Express backend from autos-prime-ng project
- **Implications**: Specifications written for Angular 18+ features (signals, standalone components) will use Angular 14 equivalents (RxJS, NgModules)

---

## OVERVIEW

This roadmap tracks the implementation of the Auto Discovery platform built entirely from technical specifications. Each phase builds on the previous, following the dependency graph defined in the specifications.

**Total Effort**: ~11 weeks (1-2 developers)
**Specifications**: 12 documents (includes auth + user prefs + navigation), ~385 KB
**Target**: Production-ready application

---

## PHASE 1: FOUNDATION (WEEKS 1-2)

### Objectives
- Set up development environment
- Implement core infrastructure
- Establish testing framework
- Create base abstractions

### Tasks

#### 1.1 Project Setup
- [x] Create project structure
- [x] Copy specifications to `specs/`
- [x] Integrate backend from autos-prime-ng (Node.js + Express + Elasticsearch)
- [x] Update backend references to auto-discovery
- [ ] Initialize Angular 14 workspace (`ng new frontend`)
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Configure git hooks (pre-commit)
- [ ] Configure backend environment variables (.env)

**Specification**: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md) (sections 8.1-8.3)

#### 1.2 Core Services

**UrlStateService** (434 lines)
- [ ] Implement URL parameter management
- [ ] Create `setQueryParams()`, `getQueryParam()`, `watchQueryParams()`
- [ ] Handle URL serialization/deserialization
- [ ] Unit tests (20+ tests)

**Specification**: [04 - State Management](./specs/04-state-management-specification.md) (section 2)

**RequestCoordinatorService** (265 lines)
- [ ] Implement 3-layer request processing (cache → dedup → HTTP)
- [ ] Create caching with TTL
- [ ] Request deduplication
- [ ] Retry logic with exponential backoff
- [ ] Unit tests (30+ tests)

**Specification**: [04 - State Management](./specs/04-state-management-specification.md) (section 3)

**FilterUrlMapperService**
- [ ] Implement bidirectional filter-to-URL mapping
- [ ] Create `filtersToParams()`, `paramsToFilters()`
- [ ] Handle special cases (year ranges, arrays)
- [ ] Unit tests (15+ tests)

**Specification**: [04 - State Management](./specs/04-state-management-specification.md) (section 4)

#### 1.3 API Service

**ApiService**
- [ ] Create service skeleton with 5 endpoint methods
- [ ] `getVehicles()`, `getManufacturerModelCombinations()`, etc.
- [ ] HTTP interceptor setup (error, auth)
- [ ] Environment configuration
- [ ] Mock HTTP tests

**Specification**: [02 - API Contracts](./specs/02-api-contracts-data-models.md)

#### 1.4 Testing Infrastructure

- [ ] Configure Karma + Jasmine
- [ ] Set up Playwright
- [ ] Create test helpers (MockDataFactory)
- [ ] Configure coverage reporting
- [ ] Write sample E2E test

**Specification**: [09 - Testing Strategy](./specs/09-testing-strategy.md) (sections 2, 3)

**Deliverables**:
- ✅ Working Angular app with routing
- ✅ Core services tested and functional
- ✅ API service ready for integration
- ✅ Test infrastructure operational

---

## PHASE 2: AUTHENTICATION & USER PREFERENCES (WEEKS 3-4)

### Objectives
- Implement JWT-based authentication
- Create user management system
- Implement file-based user preferences
- Replace localStorage with user-specific storage

### Tasks

#### 2.1 Backend Authentication (Week 3)

**JWT Service**
- [ ] Implement token generation and signing (HS256)
- [ ] Implement token verification
- [ ] Implement token refresh logic
- [ ] Unit tests (15+ tests)

**Password Service**
- [ ] Implement bcrypt password hashing
- [ ] Implement password validation
- [ ] Password complexity requirements
- [ ] Unit tests (10+ tests)

**Auth Endpoints**
- [ ] POST /api/v1/auth/login (with rate limiting)
- [ ] POST /api/v1/auth/logout
- [ ] POST /api/v1/auth/refresh
- [ ] GET /api/v1/auth/verify
- [ ] Integration tests (20+ tests)

**User Management**
- [ ] Create Elasticsearch user index mapping
- [ ] Implement bootstrap script for default admin user
- [ ] GET /api/v1/admin/users
- [ ] POST /api/v1/admin/users
- [ ] PUT /api/v1/admin/users/:id
- [ ] DELETE /api/v1/admin/users/:id
- [ ] Integration tests (15+ tests)

**Middleware**
- [ ] Create verifyToken middleware
- [ ] Create requireRole middleware
- [ ] Create requireDomain middleware
- [ ] Protect existing vehicle endpoints
- [ ] Unit tests (12+ tests)

**Specification**: [Authentication Service](./specs/auth/authentication-service.md)

#### 2.2 Frontend Authentication (Week 3)

**Auth Services**
- [ ] Create AuthService (login, logout, verify, refresh)
- [ ] Create AuthStorageService (token management)
- [ ] Create CurrentUserService (user state with hasRole/hasDomain methods)
- [ ] Unit tests (25+ tests)

**Guards & Interceptors**
- [ ] Create AuthGuard (route protection)
- [ ] Create JwtInterceptor (attach token to requests)
- [ ] Handle 401 errors (auto-logout)
- [ ] Unit tests (10+ tests)

**Login Component**
- [ ] Create login form with validation
- [ ] Handle login errors
- [ ] Redirect after successful login
- [ ] E2E tests (5+ tests)

**Navigation & Authorization**
- [ ] Create declarative menu configuration (MAIN_MENU, USER_MENU)
- [ ] Implement MenuService with role-based filtering
- [ ] Create authorization directives (*hasRole, *hasDomain, *hasPermission)
- [ ] Create TopNavComponent with PrimeNG MenuBar
- [ ] Create BreadcrumbComponent for route trails
- [ ] Unit tests for directives (15+ tests)
- [ ] E2E tests for menu visibility (10+ tests)

**Specification**:
- [Authentication Service](./specs/auth/authentication-service.md) (section 6)
- [11 - Navigation & Authorization](./specs/11-navigation-authorization.md)

#### 2.3 User Preferences Backend (Week 4)

**File Storage**
- [ ] Create ~/projects/auto-discovery-user-prefs/ directory
- [ ] Implement file read/write utilities (atomic writes)
- [ ] Implement validation logic
- [ ] Unit tests (15+ tests)

**Preferences Endpoints**
- [ ] GET /api/v1/users/:userId/preferences
- [ ] PUT /api/v1/users/:userId/preferences
- [ ] DELETE /api/v1/users/:userId/preferences
- [ ] Authorization checks (user can only access own prefs)
- [ ] Integration tests (20+ tests)

**Specification**: [10 - User Preferences Service](./specs/10-user-preferences-service.md) (sections 1-3)

#### 2.4 User Preferences Frontend (Week 4)

**UserPreferencesService**
- [ ] Create service with load/save methods
- [ ] Integrate with AuthService (load on login)
- [ ] Implement debounced save logic
- [ ] Observable state management
- [ ] Unit tests (25+ tests)

**Component Integration**
- [ ] Update DiscoverComponent to use preferences
- [ ] Remove all localStorage calls for panel order
- [ ] Remove all localStorage calls for panel collapsed state
- [ ] Update BaseDataTableComponent for table preferences
- [ ] Remove all localStorage calls for column visibility

**Migration**
- [ ] Create UserPreferencesMigrationService
- [ ] Migrate localStorage → backend on first login
- [ ] Clear localStorage after successful migration
- [ ] E2E tests (5+ tests)

**Specification**: [10 - User Preferences Service](./specs/10-user-preferences-service.md) (sections 4-5)

**Deliverables**:
- ✅ JWT authentication working (login/logout)
- ✅ User management (admin can create/edit users)
- ✅ File-based user preferences (no localStorage for user prefs)
- ✅ Preferences load on login, save on changes
- ✅ Migration from localStorage complete
- ✅ 85%+ code coverage for auth and preferences

---

## PHASE 3: CORE FEATURES (WEEKS 5-7)

### Objectives
- Implement state management
- Build filtering system
- Create data visualization components
- Establish URL-first flow

### Tasks

#### 2.1 State Management

**ResourceManagementService<TFilters, TData>** (660 lines)
- [ ] Generic service implementation
- [ ] Observable state management (BehaviorSubject)
- [ ] URL watching and synchronization
- [ ] Filter updates trigger data fetch
- [ ] Error and loading state handling
- [ ] Unit tests (40+ tests)

**VehicleResourceManagementService**
- [ ] Factory implementation
- [ ] Vehicle-specific adapters
- [ ] Integration tests with real API

**Specification**: [04 - State Management](./specs/04-state-management-specification.md) (section 1)

#### 2.2 Base Components

**BaseDataTableComponent<T>**
- [ ] Generic table with sorting, filtering, pagination
- [ ] TableDataSource interface
- [ ] Column configuration
- [ ] Responsive design
- [ ] Unit + integration tests

**Specification**: [05 - Data Visualization](./specs/05-data-visualization-components.md) (section 1)

**BaseChartComponent**
- [ ] Chart composition pattern
- [ ] Plotly.js integration
- [ ] Responsive container
- [ ] Loading states
- [ ] Unit tests

**Specification**: [05 - Data Visualization](./specs/05-data-visualization-components.md) (section 2)

#### 2.3 Filter System

**QueryControlComponent**
- [ ] Filter type dropdown
- [ ] Add Filter button
- [ ] Active filter chips display
- [ ] Clear All functionality
- [ ] Unit tests

**Filter Dialogs** (5 types):
- [ ] Manufacturer dialog (server-side search)
- [ ] Model dialog (server-side search)
- [ ] Year dialog (range slider)
- [ ] Body Class dialog (client-side search)
- [ ] Data Source dialog (client-side search)

**Specification**: [06 - Filter & Picker](./specs/06-filter-picker-components.md) (section 1)

#### 2.4 Picker Components

**BasePickerComponent<T>**
- [ ] Configuration-driven picker
- [ ] URL hydration (pendingHydration → hydrateSelections)
- [ ] Selection state (Set<string>)
- [ ] Apply button
- [ ] Unit tests

**BasePickerDataSource<T>**
- [ ] Client/server pagination modes
- [ ] Data transformation
- [ ] Loading states

**PickerConfig System**
- [ ] Define PickerConfig interface
- [ ] Create 2-3 example configs
- [ ] PickerConfigService

**Specification**: [06 - Filter & Picker](./specs/06-filter-picker-components.md) (sections 2, 5)

#### 2.5 Chart Implementations

**ChartDataSource Pattern**:
- [ ] ManufacturerChartDataSource
- [ ] ModelsChartDataSource
- [ ] YearChartDataSource
- [ ] BodyClassChartDataSource

**Chart Components**:
- [ ] 4 concrete chart components using BaseChart
- [ ] Highlight support
- [ ] Click interactions
- [ ] Unit tests for data transformation

**Specification**: [05 - Data Visualization](./specs/05-data-visualization-components.md) (section 3)

#### 2.6 Results Table

**ResultsTableComponent**
- [ ] Uses BaseDataTableComponent<VehicleResult>
- [ ] Receives state from ResourceManagementService
- [ ] Expandable rows (VIN instances)
- [ ] Column visibility management
- [ ] Integration tests

**Specification**: [03 - Discover Feature](./specs/03-discover-feature-specification.md) (section 3.6)

**Deliverables**:
- ✅ URL-first state management working end-to-end
- ✅ Filters applied and reflected in URL
- ✅ Data visualization components functional
- ✅ 70%+ code coverage

---

## PHASE 4: ADVANCED FEATURES (WEEKS 8-9)

### Objectives
- Implement pop-out window system
- Add drag-drop panel reordering
- State persistence
- Advanced picker (DualCheckboxPicker)

### Tasks

#### 3.1 Pop-Out Window System

**PopOutContextService**
- [ ] `isInPopOut()` detection
- [ ] `initializeAsPopOut()`, `initializeAsParent()`
- [ ] BroadcastChannel setup
- [ ] Message sending/receiving
- [ ] Unit tests

**PanelPopoutComponent**
- [ ] Route: `/panel/:gridId/:panelId/:type`
- [ ] Component rendering (ngSwitch)
- [ ] Message handling
- [ ] URL watching in pop-out
- [ ] Integration tests

**DiscoverComponent Pop-Out Logic**:
- [ ] `popOutPanel()` method
- [ ] Window.open() with features
- [ ] BroadcastChannel per panel
- [ ] Window close detection (polling)
- [ ] Placeholder display
- [ ] Panel restoration

**Specification**: [07 - Pop-Out Window System](./specs/07-popout-window-system.md)

#### 3.2 Drag-Drop Panel Reordering

- [ ] Import Angular CDK Drag-Drop
- [ ] Implement `cdkDrag` directives
- [ ] `onPanelDrop()` handler
- [ ] Visual feedback (drag preview, placeholder)
- [ ] Persist order to localStorage
- [ ] E2E tests for drag-drop

**Specification**: [03 - Discover Feature](./specs/03-discover-feature-specification.md) (section 4)

#### 3.3 State Persistence

- [ ] localStorage wrapper service
- [ ] Save panel order
- [ ] Save column visibility
- [ ] Restore on page load
- [ ] Version migration support

**Specification**: [03 - Discover Feature](./specs/03-discover-feature-specification.md) (section 6)

#### 3.4 DualCheckboxPicker

**DualCheckboxPickerComponent**
- [ ] Hierarchical manufacturer → models structure
- [ ] Tri-state parent checkboxes
- [ ] `getManufacturerCheckState()` logic
- [ ] Bulk selection
- [ ] URL hydration
- [ ] Unit tests for tri-state logic

**Specification**: [06 - Filter & Picker](./specs/06-filter-picker-components.md) (section 3)

#### 3.5 Column Management

**ColumnManagerComponent**
- [ ] Drag-drop column reordering
- [ ] Show/hide columns
- [ ] Reset to defaults
- [ ] Persist to localStorage
- [ ] Unit tests

**Specification**: [05 - Data Visualization](./specs/05-data-visualization-components.md) (section 1.4)

**Deliverables**:
- ✅ Pop-out windows working with state sync
- ✅ Drag-drop panel reordering functional
- ✅ State persisted across sessions
- ✅ Advanced picker components complete

---

## PHASE 5: POLISH & TESTING (WEEKS 10-11)

### Objectives
- Complete E2E test suite
- Performance optimization
- Accessibility compliance
- Error handling
- Documentation

### Tasks

#### 4.1 E2E Test Suite

**7 Test Categories** (~50 tests total):
- [ ] Category 1: Basic Filters (7 tests)
- [ ] Category 2: Pop-Out Lifecycle (7 tests)
- [ ] Category 3: Filter-PopOut Interactions (7 tests)
- [ ] Category 4: Highlight Operations (7 tests)
- [ ] Category 5: Multi-Window Sync (7 tests)
- [ ] Category 6: URL Persistence (7 tests)
- [ ] Category 7: Errors & Edge Cases (7 tests)

**Specification**: [09 - Testing Strategy](./specs/09-testing-strategy.md) (section 3.2)

#### 4.2 Performance Optimization

- [ ] Bundle analysis (`webpack-bundle-analyzer`)
- [ ] Lazy loading for feature modules
- [ ] OnPush change detection verification
- [ ] Plotly.js performance tuning
- [ ] Lighthouse CI integration
- [ ] Meet targets: < 5 MB bundle, < 3s load

**Specification**: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md) (section 1)

#### 4.3 Accessibility

- [ ] Keyboard navigation for all features
- [ ] ARIA labels and roles
- [ ] Focus management (dialogs, pop-outs)
- [ ] Color contrast verification
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] axe-core automated testing
- [ ] WCAG 2.1 AA compliance audit

**Specification**: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md) (section 3)

#### 4.4 Error Handling

**ErrorInterceptor**
- [ ] HTTP error categorization
- [ ] User-friendly notifications
- [ ] Logging for debugging
- [ ] Integration with RequestCoordinator retry

**GlobalErrorHandler**
- [ ] Uncaught error handling
- [ ] ChunkLoadError detection
- [ ] Error notification service

**Specification**: [08 - Non-Functional Requirements](./specs/08-non-functional-requirements.md) (section 6)

#### 4.5 Documentation

- [ ] `docs/DEVELOPMENT.md` - Development guide
- [ ] `docs/ARCHITECTURE.md` - Architecture decisions
- [ ] `docs/DEPLOYMENT.md` - Deployment guide
- [ ] API documentation (JSDoc)
- [ ] Component usage examples
- [ ] Troubleshooting guide

**Deliverables**:
- ✅ E2E test suite complete (50+ tests)
- ✅ 85%+ code coverage
- ✅ Performance targets met
- ✅ WCAG 2.1 AA compliant
- ✅ Comprehensive documentation

---

## PHASE 6: DEPLOYMENT (WEEK 12)

### Objectives
- Production build
- CI/CD pipeline
- Deployment configuration
- Monitoring

### Tasks

#### 5.1 Production Build

- [ ] Production environment configuration
- [ ] Build optimization (AOT, tree-shaking)
- [ ] Bundle size verification
- [ ] Source maps configuration
- [ ] Asset optimization

#### 5.2 CI/CD Pipeline

**GitHub Actions / GitLab CI**:
- [ ] Build stage
- [ ] Unit test stage
- [ ] E2E test stage
- [ ] Coverage reporting
- [ ] Deployment stage
- [ ] Pipeline optimization

**Specification**: [09 - Testing Strategy](./specs/09-testing-strategy.md) (section 8)

#### 5.3 Deployment

- [ ] Choose hosting (Vercel, Netlify, AWS S3, etc.)
- [ ] Configure deployment
- [ ] Environment variables
- [ ] CDN setup
- [ ] SSL/TLS certificates
- [ ] Domain configuration

#### 5.4 Monitoring

- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Google Analytics or similar)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Logging aggregation

**Deliverables**:
- ✅ Production deployment live
- ✅ CI/CD pipeline operational
- ✅ Monitoring in place
- ✅ Project complete

---

## SUCCESS CRITERIA

### Functional
- ✅ All features from specifications implemented
- ✅ URL-first state management working
- ✅ Pop-out windows with state sync
- ✅ Drag-drop panel reordering
- ✅ All filter types functional
- ✅ Charts interactive and responsive

### Quality
- ✅ 85%+ code coverage
- ✅ All E2E tests passing
- ✅ Bundle size < 5 MB
- ✅ Load time < 3 seconds
- ✅ WCAG 2.1 AA compliant
- ✅ Zero critical bugs

### Documentation
- ✅ All specs followed
- ✅ Development docs complete
- ✅ API docs generated
- ✅ Deployment guide ready

---

## TRACKING

### Legend
- [x] Complete
- [ ] Not started
- [~] In progress
- [!] Blocked

### Progress Summary

| Phase | Tasks Complete | Total Tasks | % Complete |
|-------|----------------|-------------|------------|
| Phase 1 | 2 | 15 | 13% |
| Phase 2 | 0 | 31 | 0% |
| Phase 3 | 0 | 20 | 0% |
| Phase 4 | 0 | 18 | 0% |
| Phase 5 | 0 | 18 | 0% |
| Phase 6 | 0 | 12 | 0% |
| **Total** | **2** | **114** | **2%** |

---

## DEPENDENCIES

```
Phase 1 (Foundation)
  └─> Phase 2 (Authentication & User Preferences)
        └─> Phase 3 (Core Features)
              ├─> Phase 4 (Advanced Features)
              │     └─> Phase 5 (Polish & Testing)
              │           └─> Phase 6 (Deployment)
              └─> Phase 5 (can start after Phase 3)
```

---

## RISK MANAGEMENT

### Known Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Plotly.js bundle size | High | Lazy load, tree-shake |
| BroadcastChannel browser support | Medium | Feature detection, fallback |
| Pop-out blocker issues | Medium | User guidance, detection |
| E2E test flakiness | Medium | Proper waits, retry logic |
| Spec interpretation ambiguity | Low | Document decisions |

---

## NOTES

- **Specification-Driven**: All decisions must reference specs
- **No Source Code**: Never reference original implementation
- **Test-First**: Write tests before implementation
- **Iterative**: Each phase builds on previous
- **Quality Over Speed**: Meet quality standards

---

**Last Updated**: 2025-11-15
**Next Review**: End of Phase 1
