# Auto Discovery
## Vehicle Discovery Platform - Greenfield Implementation

**Status**: 🚧 New Development (Specification-Driven)
**Started**: 2025-11-15
**Stack**: Angular 14 | PrimeNG | Plotly.js | TypeScript | Node.js Backend

---

## OVERVIEW

This is a **greenfield rebuild** of the Vehicle Discovery Platform, implemented entirely from comprehensive technical specifications without reference to original source code.

**Purpose**: Modern web application for exploring and analyzing vehicle data from authoritative sources (NHTSA, EPA, CARFAX, etc.).

**Key Features**:
- Advanced filtering (manufacturer, model, year, body class, data source)
- Interactive Plotly.js charts with drill-down
- Multi-window dashboard (pop-out panels to separate browser windows)
- URL-first state management (shareable/bookmarkable URLs)
- Configuration-driven components (no boilerplate)
- Drag-drop panel reordering
- Full test coverage (unit, integration, E2E)

---

## SPECIFICATION-DRIVEN DEVELOPMENT

Built **100% from specifications** in [`specs/`](./specs/):

| # | Specification | Size | Status |
|---|---------------|------|--------|
| 01 | [Architectural Analysis](./specs/01-architectural-analysis.md) | 72 KB | ✅ Complete |
| 02 | [API Contracts & Data Models](./specs/02-api-contracts-data-models.md) | 837 B | ⚠️ Needs expansion |
| 03 | [Discover Feature](./specs/03-discover-feature-specification.md) | 9.3 KB | ⚠️ Update needed (remove localStorage) |
| 04 | [State Management](./specs/04-state-management-specification.md) | 61 KB | ✅ Complete |
| 05 | [Data Visualization](./specs/05-data-visualization-components.md) | 21 KB | ⚠️ Update needed (remove localStorage) |
| 06 | [Filter & Picker Components](./specs/06-filter-picker-components.md) | 15 KB | ✅ Complete |
| 07 | [Pop-Out Window System](./specs/07-popout-window-system.md) | 16 KB | ✅ Complete |
| 08 | [Non-Functional Requirements](./specs/08-non-functional-requirements.md) | 22 KB | ✅ Complete |
| 09 | [Testing Strategy](./specs/09-testing-strategy.md) | 32 KB | ✅ Complete |
| 10 | [User Preferences Service](./specs/10-user-preferences-service.md) | 42 KB | ✅ Complete |
| 11 | [Navigation & UI Authorization](./specs/11-navigation-authorization.md) | 55 KB | ✅ Complete |
| -- | [Authentication Service](./specs/auth/authentication-service.md) | 40 KB | ✅ Complete |

**Total**: ~385 KB of implementation-ready specifications

---

## QUICK START

### Prerequisites
- Node.js 16+ or 18+
- npm 8+ or 9+
- Angular CLI 14 (`npm install -g @angular/cli@14`)

### Setup

```bash
cd /home/odin/projects/auto-discovery

# Create Angular workspace
ng new frontend --routing --style=scss --strict

# Install dependencies
cd frontend
npm install primeng primeicons plotly.js-dist-min @angular/cdk
npm install -D @playwright/test

# Start development
npm start
```

---

## PROJECT STRUCTURE

```
auto-discovery/
├── specs/                          # Complete specifications (248 KB)
│   ├── README.md
│   ├── 01-architectural-analysis.md
│   ├── 02-api-contracts-data-models.md
│   ├── 03-discover-feature-specification.md
│   ├── 04-state-management-specification.md
│   ├── 05-data-visualization-components.md
│   ├── 06-filter-picker-components.md
│   ├── 07-popout-window-system.md
│   ├── 08-non-functional-requirements.md
│   └── 09-testing-strategy.md
│
├── frontend/                       # Angular app (to be created)
│   ├── src/app/
│   │   ├── core/                  # Services, interceptors, guards
│   │   ├── features/              # Discover, etc.
│   │   └── shared/                # Reusable components
│   ├── e2e/                       # Playwright tests
│   └── package.json
│
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── config/                # Elasticsearch config
│   │   ├── controllers/           # Vehicle controllers
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   └── index.js               # Server entry point
│   └── package.json
│
├── docs/                           # Project docs
│   ├── DEVELOPMENT.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── ROADMAP.md                      # Development plan
└── README.md                       # This file
```

---

## DEVELOPMENT ROADMAP

### Phase 1: Foundation (Weeks 1-2) ⏳
- [x] Complete specifications
- [ ] Angular workspace setup
- [ ] Core services (UrlState, RequestCoordinator, FilterUrlMapper)
- [ ] Base components (BaseDataTable, BaseChart)
- [ ] API service skeleton
- [ ] Unit test infrastructure

### Phase 2: Authentication & User Preferences (Weeks 3-4) ⏳
- [ ] JWT-based authentication (login/logout/refresh)
- [ ] User management (admin endpoints)
- [ ] File-based user preferences storage
- [ ] Frontend AuthService and guards
- [ ] UserPreferencesService integration
- [ ] Migration from localStorage

### Phase 3: Core Features (Weeks 5-7) ⏳
- [ ] ResourceManagementService (generic state management)
- [ ] QueryControlComponent (filter dialogs)
- [ ] BasePickerComponent + configurations
- [ ] DualCheckboxPicker (tri-state selection)
- [ ] ResultsTableComponent
- [ ] Chart components (4 types)
- [ ] URL-first state flow

### Phase 4: Advanced Features (Weeks 8-9) ⏳
- [ ] Pop-out window system (BroadcastChannel)
- [ ] PopOutContextService
- [ ] PanelPopoutComponent
- [ ] Drag-drop panel reordering (CDK)
- [ ] ColumnManagerComponent

### Phase 5: Polish & Testing (Weeks 10-11) ⏳
- [ ] E2E test suite (7 categories, ~50 tests)
- [ ] Performance optimization (< 5 MB bundle)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Error handling (interceptors, global handler)
- [ ] Documentation

### Phase 6: Deployment (Week 12) ⏳
- [ ] Production build
- [ ] CI/CD pipeline (GitHub Actions or GitLab CI)
- [ ] Deployment configuration
- [ ] Monitoring setup

---

## TECH STACK

**Frontend**:
- Angular 14 (modules, services, RxJS-based state)
- PrimeNG 14.2+ (UI components)
- Plotly.js 3.2+ (charts)
- Angular CDK (drag-drop)
- RxJS 7+ (reactive state)
- SCSS (Lara Light Red theme)

**Testing**:
- Karma + Jasmine (unit tests)
- Playwright (E2E tests)
- Coverage: 75% min, 85% target

**Backend**:
- Node.js + Express
- Elasticsearch 8+ integration
- RESTful API (vehicle data service)
- CORS enabled for frontend integration

---

## QUALITY TARGETS

| Metric | Target | Maximum |
|--------|--------|---------|
| Bundle size | < 5 MB | < 10 MB |
| Initial load | < 3s | < 5s |
| Time to Interactive | < 4s | < 6s |
| Code coverage | 85% | 75% min |
| WCAG Level | AA | A min |

---

## DEVELOPMENT PRINCIPLES

### 1. Specification Fidelity
- Specifications are the source of truth
- Document any deviations with justification
- Never reference original source code

### 2. Angular 14 Patterns
- NgModule-based architecture
- Service-based state management with RxJS
- OnPush change detection everywhere
- Dependency injection for testability

### 3. Configuration Over Code
- PickerConfig for all pickers
- ChartDataSource pattern for charts
- Generic ResourceManagementService

### 4. URL-First State
- URL is single source of truth
- All state serializable to URL
- BroadcastChannel for cross-window sync

---

## TESTING

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests (all)
npm run e2e

# E2E tests (smoke)
npm run e2e:smoke

# E2E tests (UI mode)
npm run e2e:ui
```

**E2E Test Categories** (from spec 09):
1. Basic Filters (Tests 002-020)
2. Pop-Out Lifecycle (Tests 021-040)
3. Filter-PopOut Interactions (Tests 041-060)
4. Highlight Operations (Tests 061-080)
5. Multi-Window Sync (Tests 081-100)
6. URL Persistence (Tests 101-120)
7. Errors & Edge Cases (Tests 121-140)

---

## CONTRIBUTING

### Workflow
1. Read relevant specification
2. Create feature branch
3. Write tests first (from spec examples)
4. Implement feature
5. Verify against spec
6. Create PR with spec references

### Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- JSDoc comments
- No `any` types

---

## DOCUMENTATION

### Technical Documentation

- **Specifications**: [`specs/README.md`](./specs/README.md) - All technical specs (9 documents)
- **Authentication**: [`specs/auth/authentication-service.md`](./specs/auth/authentication-service.md) - Auth & authorization system
- **Roadmap**: [`ROADMAP.md`](./ROADMAP.md) - Development phases and timeline

### Project Management & Workflow

- **Documentation Index**: [`DOCUMENTATION-INDEX.md`](./DOCUMENTATION-INDEX.md) - Central hub for all documentation
- **Workflow Guide**: [`WORKFLOW.md`](./WORKFLOW.md) - Complete workflow and team organization
- **Quick Reference**: [`WORKFLOW-QUICK-REFERENCE.md`](./WORKFLOW-QUICK-REFERENCE.md) - Common scenarios and flowcharts
- **Contributing**: [`CONTRIBUTING.md`](./CONTRIBUTING.md) - Coding standards, commit conventions
- **Getting Started**: [`GETTING-STARTED.md`](./GETTING-STARTED.md) - Developer onboarding (30 minutes)

### For Specific Roles

- **Individual Contributors**: Start with [WORKFLOW-QUICK-REFERENCE.md](./WORKFLOW-QUICK-REFERENCE.md) + [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Team Lead**: See [WORKFLOW.md](./WORKFLOW.md) (Roles & Responsibilities section)
- **Project Manager**: See [WORKFLOW.md](./WORKFLOW.md) (PM sections) + [ROADMAP.md](./ROADMAP.md)

---

## MVP: PICKER DEMO

Before full implementation, validate the configuration-driven picker architecture with a focused MVP:

📦 **MVP Deliverable**: Working picker demo page showcasing:
- Single-selection picker (Body Class filter)
- Dual-hierarchy picker (Manufacturer-Model combinations)
- Configuration-driven architecture
- URL-based state management

**Documentation**:
- 📘 **[MVP Specification](./docs/MVP-PICKER-DEMO.md)** - Complete implementation guide
- 🚀 **[Quick Start Guide](./docs/MVP-QUICK-START.md)** - Get running in 30 minutes

**Estimated Time**: 4-6 hours for complete MVP implementation

---

## STATUS

✅ **Specifications complete** (12 documents, 385 KB)
✅ **MVP specification ready**
⏳ **Ready for implementation**
🚀 **Next**: Implement MVP or set up Angular workspace

---

*Built from specifications. No original source code referenced.*
