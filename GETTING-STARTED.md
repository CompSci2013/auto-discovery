# Getting Started Guide
## Auto Discovery - Quick Start for Developers

**Audience**: New developers joining the project
**Prerequisites**: Node.js 16+, Angular CLI 14, Docker/Podman (for containerized development)
**Time**: ~30 minutes to complete setup

---

## STEP 1: UNDERSTAND THE PROJECT

### What is Auto Discovery?

Auto Discovery is a **greenfield rebuild** of a vehicle discovery platform, built **entirely from specifications** without referencing original source code.

### Key Concepts

1. **Specification-Driven Development**
   - All implementation decisions come from specs in `specs/`
   - Specs are the source of truth (not original code)
   - Document any deviations with justification

2. **URL-First State Management**
   - URL is the single source of truth for application state
   - All filters, selections, highlights stored in URL
   - URLs are shareable and bookmarkable

3. **Configuration-Driven Components**
   - Pickers use `PickerConfig` (no boilerplate)
   - Charts use `ChartDataSource` pattern
   - Generic `ResourceManagementService<TFilters, TData>`

4. **Multi-Window Support**
   - Panels can pop out to separate browser windows
   - State synchronized via `BroadcastChannel` API
   - MOVE semantics (panel disappears from main window)

---

## STEP 2: READ SPECIFICATIONS

### Essential Reading (Start Here)

**First**: [specs/README.md](./specs/README.md)
- Overview of all specifications
- How to use the specs
- Document conventions

**Second**: [specs/01-architectural-analysis.md](./specs/01-architectural-analysis.md)
- System architecture
- Technology stack
- Patterns and principles
- 20 components, 12 services overview

**Third**: [specs/04-state-management-specification.md](./specs/04-state-management-specification.md)
- URL-first pattern
- ResourceManagementService
- Core state flow

### When You Need Them

| Spec | When to Read |
|------|--------------|
| [02 - API Contracts](./specs/02-api-contracts-data-models.md) | Working with API calls |
| [03 - Discover Feature](./specs/03-discover-feature-specification.md) | Building main page |
| [05 - Data Visualization](./specs/05-data-visualization-components.md) | Building tables/charts |
| [06 - Filter & Picker](./specs/06-filter-picker-components.md) | Building filters/pickers |
| [07 - Pop-Out Windows](./specs/07-popout-window-system.md) | Implementing pop-outs |
| [08 - Non-Functional](./specs/08-non-functional-requirements.md) | Quality standards |
| [09 - Testing Strategy](./specs/09-testing-strategy.md) | Writing tests |

---

## STEP 3: ENVIRONMENT SETUP

### Install Prerequisites

**⚠️ IMPORTANT**: This project uses **container-based development**. See [docs/DEVELOPMENT-ENVIRONMENT.md](docs/DEVELOPMENT-ENVIRONMENT.md) for the recommended containerized workflow.

**For Container-Based Development (Recommended)**:
```bash
# Verify Docker or Podman
podman --version
# OR
docker --version

# Build development container image
cd /home/odin/projects/auto-discovery
podman build -f docs/Dockerfile.dev -t localhost/auto-discovery-frontend:dev .
```

**For Traditional Development (Optional)**:
```bash
# Verify Node.js (16+ or 18+)
node --version

# Verify npm (8+ or 9+)
npm --version

# Install Angular CLI 14 globally
npm install -g @angular/cli@14

# Verify Angular CLI
ng version
```

### Clone and Setup

```bash
# Navigate to project
cd /home/odin/projects/auto-discovery

# Create Angular workspace
ng new frontend --routing --style=scss --strict

# Navigate to frontend
cd frontend

# Install dependencies
npm install primeng primeicons
npm install plotly.js-dist-min
npm install @angular/cdk

# Install dev dependencies
npm install -D @playwright/test
npm install -D eslint prettier
```

### Verify Setup

```bash
# Start dev server
npm start

# Should open http://localhost:4200
# You should see default Angular welcome page
```

---

## STEP 4: PROJECT STRUCTURE

```
auto-discovery/
├── specs/                    # ✅ Complete specifications (READ THESE)
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
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Elasticsearch configuration
│   │   ├── controllers/      # API controllers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── index.js          # Server entry point
│   └── package.json
│
├── k8s/                      # Kubernetes deployment configs
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
│
├── frontend/                 # Angular 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # ← Start here (services)
│   │   │   │   ├── services/
│   │   │   │   ├── interceptors/
│   │   │   │   └── guards/
│   │   │   ├── features/    # Feature modules
│   │   │   │   └── discover/
│   │   │   └── shared/      # Reusable components
│   │   │       ├── components/
│   │   │       ├── pipes/
│   │   │       └── directives/
│   │   ├── environments/
│   │   └── styles.scss
│   ├── e2e/                 # Playwright E2E tests
│   └── package.json
│
├── docs/                    # Project documentation
├── ROADMAP.md              # Development plan
├── README.md               # Project overview
└── GETTING-STARTED.md      # This file
```

---

## STEP 5: FIRST TASK - CORE SERVICES

### Start with Phase 1 (Foundation)

According to [ROADMAP.md](./ROADMAP.md), Phase 1 focuses on core services:

1. **UrlStateService** - URL parameter management
2. **RequestCoordinatorService** - Caching, deduplication, retry
3. **FilterUrlMapperService** - Filter serialization
4. **ApiService** - HTTP client wrapper

### Implementation Workflow

```
1. Read specification
   ↓
2. Create service file
   ↓
3. Create test file (*.spec.ts)
   ↓
4. Write tests (from spec examples)
   ↓
5. Implement service
   ↓
6. Run tests
   ↓
7. Commit with conventional commit message
```

### Example: Creating UrlStateService

```bash
# Create service
ng generate service core/services/url-state

# This creates:
# - src/app/core/services/url-state.service.ts
# - src/app/core/services/url-state.service.spec.ts
```

**Then**:

1. Open [specs/04-state-management-specification.md](./specs/04-state-management-specification.md), section 2
2. Copy interface definitions to service file
3. Write tests based on spec examples
4. Implement methods following spec
5. Run `npm test` to verify

---

## STEP 6: DEVELOPMENT WORKFLOW

### Daily Workflow

```bash
# 1. Start day: pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feat/url-state-service

# 3. Read relevant spec section
cat specs/04-state-management-specification.md | less

# 4. Run tests in watch mode
npm test -- --watch

# 5. Implement feature
# (write tests first, then code)

# 6. Verify tests pass
npm test

# 7. Commit with conventional commit
git commit -m "feat(core): implement UrlStateService

Implements URL parameter management with:
- setQueryParams() for updating URL
- getQueryParam() for reading params
- watchQueryParams() for observing changes

Ref: specs/04-state-management-specification.md section 2"

# 8. Push and create PR
git push origin feat/url-state-service
```

### Testing Workflow

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests in UI mode (interactive)
npm run e2e:ui

# Run specific test file
npm test -- --include='**/url-state.service.spec.ts'
```

---

## STEP 7: CODE STANDARDS

### TypeScript

```typescript
// ✅ Good: Explicit types, no any
public getQueryParam(key: string): string | null {
  return this.router.parseUrl(this.router.url).queryParams[key] || null;
}

// ❌ Bad: Implicit any
public getQueryParam(key) {
  return this.router.parseUrl(this.router.url).queryParams[key];
}
```

### Testing

```typescript
// ✅ Good: Descriptive test names, Arrange-Act-Assert
it('should return null when parameter does not exist', () => {
  // Arrange
  const key = 'nonexistent';

  // Act
  const result = service.getQueryParam(key);

  // Assert
  expect(result).toBeNull();
});

// ❌ Bad: Vague test name
it('should work', () => {
  expect(service.getQueryParam('foo')).toBeTruthy();
});
```

### Commits

```bash
# ✅ Good: Conventional commits with spec references
git commit -m "feat(core): implement RequestCoordinatorService caching

Adds 3-layer request processing:
- Cache layer with TTL
- Deduplication for concurrent requests
- HTTP with retry logic

Ref: specs/04-state-management-specification.md section 3.1"

# ❌ Bad: Vague commit message
git commit -m "Add caching"
```

---

## STEP 8: GETTING HELP

### Resources

1. **Specifications** (primary source)
   - `specs/` directory
   - Most detailed and authoritative

2. **Roadmap** ([ROADMAP.md](./ROADMAP.md))
   - Task breakdown
   - Dependencies
   - Progress tracking

3. **README** ([README.md](./README.md))
   - Project overview
   - Quick reference

4. **Documentation** (`docs/` - to be created)
   - Development guide
   - Architecture decisions
   - Deployment guide

### When Stuck

1. **Re-read the specification** - Often answers are there
2. **Check ROADMAP.md** - See if task dependencies are clear
3. **Look at spec examples** - Most specs have code examples
4. **Create an issue** - Document the question/blocker
5. **Ask team** - Discuss interpretation of specs

---

## STEP 9: FIRST MILESTONE

### Goal: Complete Phase 1 Foundation

**Estimated Time**: 1-2 weeks

**Tasks**:
- ✅ Project setup complete
- [ ] UrlStateService implemented and tested
- [ ] RequestCoordinatorService implemented and tested
- [ ] FilterUrlMapperService implemented and tested
- [ ] ApiService skeleton created
- [ ] Test infrastructure operational

**Success Criteria**:
- All Phase 1 unit tests passing (60+ tests)
- Code coverage > 80% for core services
- Clean TypeScript compilation (strict mode)
- Linter passing with no errors

---

## STEP 10: NEXT STEPS

### After Phase 1

1. **Review Phase 1 code** - Team review
2. **Update ROADMAP.md** - Mark tasks complete
3. **Start Phase 2** - Core features (state management)
4. **Keep specs open** - Reference constantly

### Long-Term Goals

- **Week 5**: Core features complete (filters, pickers, charts)
- **Week 7**: Advanced features (pop-outs, drag-drop)
- **Week 9**: Testing and polish complete
- **Week 10**: Production deployment

---

## QUICK REFERENCE

### Essential Commands

```bash
# Development
npm start                    # Start dev server
npm test                     # Run unit tests
npm run test:coverage        # Coverage report
npm run e2e                  # E2E tests

# Code Quality
npm run lint                 # Run ESLint
npm run format               # Run Prettier
npm run build                # Production build

# Verification
ng build --configuration production  # Build with budgets
npm run test:coverage -- --code-coverage-threshold 75  # Check coverage
```

### Quick Links

- Specs: `specs/README.md`
- Roadmap: `ROADMAP.md`
- Tech Stack: `README.md` (section: TECH STACK)
- Quality Targets: `README.md` (section: QUALITY TARGETS)

---

## WELCOME ABOARD! 🚀

You're now ready to start building Auto Discovery from specifications!

**Next Action**: Read `specs/01-architectural-analysis.md` to understand the system architecture.

---

*Questions? Check the specifications first, then create an issue.*
