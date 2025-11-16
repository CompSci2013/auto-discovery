# Auto Discovery Development Environment Setup
**Greenfield Project - Specification-Driven Development**

**Document Version:** 1.0
**Date:** 2025-11-15
**Purpose:** Complete development environment setup for Auto Discovery platform

---

## Overview

This document provides verified steps to set up the development environment for **Auto Discovery**, a greenfield Angular 14 application built entirely from specifications.

## ⚠️ CONTAINER-BASED DEVELOPMENT

**CRITICAL**: This project uses **100% container-based development**. All Angular CLI commands, npm commands, and development tools run **inside containers**.

**Host Machine (Thor)**:
- Edit source code (VS Code Remote-SSH, vim, etc.)
- Git operations (commit, push, pull, branch)
- Container management (build, run, stop, exec)
- Volume mounts provide live code sync

**Development Container**:
- Angular CLI (`ng serve`, `ng generate`, `ng build`)
- npm commands (`npm start`, `npm test`, `npm run build`)
- Node.js runtime and all dependencies
- Hot Module Reloading (HMR) for instant updates

**You will NEVER run `npm` or `ng` commands directly on the host machine.**

**Key Differences from Traditional Setup**:
- ✅ No existing code to migrate
- ✅ Specifications drive all decisions
- ✅ Angular 14 with stable, production-ready features
- ✅ **100% containerized development workflow**
- ✅ Clean slate for best practices

**Prerequisites**:
- Docker or Podman for containerization (**REQUIRED**)
- Git for version control
- Code editor (VS Code recommended)
- **NOT REQUIRED**: Node.js or npm on host machine

---

## Phase 1: Container-Based Angular Workspace Setup

**🚀 CONTAINER-FIRST APPROACH**: All npm/ng commands run inside containers from the very beginning. The host machine is ONLY used for editing code, git operations, and container management.

### Step 1: Build Development Docker Image

**Location**: Host machine (Thor)
**Directory**: `/home/odin/projects/auto-discovery`

First, we build the development image that contains Node.js and Angular CLI:

```bash
# On host machine
cd /home/odin/projects/auto-discovery

# Build dev image with Podman (recommended)
podman build -f docs/Dockerfile.dev -t localhost/auto-discovery-frontend:dev .

# OR with Docker:
docker build -f docs/Dockerfile.dev -t auto-discovery-frontend:dev .
```

**Expected Output**:
- "Successfully tagged localhost/auto-discovery-frontend:dev"

**What this image contains**:
- Node.js 20 Alpine Linux
- Angular CLI 14 pre-installed globally (`@angular/cli@14`)
- No application code (code will be mounted via volume)

**Time**: ~1-2 minutes (depending on network speed)

---

### Step 2: Create Empty Frontend Directory

**Location**: Host machine (Thor)

Create an empty directory that will be mounted into the container:

```bash
# On host machine
cd /home/odin/projects/auto-discovery

# Create empty frontend directory
mkdir frontend
```

**Why**: This directory will be volume-mounted into the container. Angular CLI will create workspace files inside the container, and they'll appear here on the host via the mount.

---

### Step 3: Start Development Container

**Location**: Host machine (Thor)

Create and start the development container with the empty frontend directory mounted:

```bash
# On host machine
cd /home/odin/projects/auto-discovery

# Start container with Podman
podman run -d --name auto-discovery-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  localhost/auto-discovery-frontend:dev

# OR with Docker:
docker run -d --name auto-discovery-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  auto-discovery-frontend:dev
```

**Expected Output**: Container ID (64 characters)

**Verify container is running**:

```bash
# On host machine
podman ps | grep auto-discovery-dev
# Should show "Up" status
```

**Flags Explained**:
- `-d`: Run detached (background)
- `--name auto-discovery-dev`: Name for easy reference
- `--network host`: Container shares host network stack
- `-v $(pwd)/frontend:/app:z`: Mount empty frontend dir (`:z` for SELinux)
- `-w /app`: Set working directory to /app inside container

---

### Step 4: Create Angular Workspace Inside Container

**Location**: Inside container (execute from host via `podman exec`)

Now we'll run `ng new` inside the container to create the Angular workspace:

```bash
# On host machine, execute command inside container
podman exec -it auto-discovery-dev ng new frontend --directory ./ --routing --style=scss --strict

# This command:
# - Runs INSIDE the container
# - Creates Angular workspace in /app (current directory inside container)
# - Files appear in ~/projects/auto-discovery/frontend on host via volume mount
```

**Answer prompts** (inside container):
- Would you like to add Angular routing? **Yes**
- Which stylesheet format would you like to use? **SCSS**

**Expected Output** (from inside container):
- "CREATE frontend/" messages
- npm install progress
- "✔ Packages installed successfully"
- "Successfully initialized git" (creates git repo inside /app)

**Time**: ~2-3 minutes

**What happens**:
1. Angular CLI runs inside container
2. Creates workspace files in `/app` (inside container)
3. Volume mount syncs files to `~/projects/auto-discovery/frontend` (on host)
4. npm installs dependencies in `/app/node_modules` (inside container)
5. You can now edit the files on host, run commands in container

---

### Step 5: Install Additional Dependencies Inside Container

**Location**: Inside container

Install PrimeNG, Plotly.js, and other dependencies:

```bash
# On host machine, execute commands inside container
podman exec -it auto-discovery-dev npm install primeng primeicons

podman exec -it auto-discovery-dev npm install plotly.js-dist-min

podman exec -it auto-discovery-dev npm install -D @types/plotly.js

podman exec -it auto-discovery-dev npm install @angular/cdk

podman exec -it auto-discovery-dev npm install -D @playwright/test

podman exec -it auto-discovery-dev npm install -D eslint prettier

podman exec -it auto-discovery-dev npm install -D @angular-eslint/builder @angular-eslint/schematics
```

**Expected Output**: Package installation messages, package.json and package-lock.json updated

**Alternative - Interactive Shell**:

```bash
# On host, enter container shell
podman exec -it auto-discovery-dev sh

# Now inside container - run all npm commands:
npm install primeng primeicons
npm install plotly.js-dist-min
npm install -D @types/plotly.js
npm install @angular/cdk
npm install -D @playwright/test
npm install -D eslint prettier
npm install -D @angular-eslint/builder @angular-eslint/schematics

# Exit container shell
exit
```

---

### Step 6: Configure ESLint and Prettier Inside Container

**Location**: Inside container

```bash
# On host, execute inside container
podman exec -it auto-discovery-dev ng add @angular-eslint/schematics
```

**Create Prettier config** (`frontend/.prettierrc.json`) - edit on host:

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

**Add scripts to package.json** - edit on host at `frontend/package.json`:

```json
{
  "scripts": {
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss}\""
  }
}
```

---

### Step 7: Configure Playwright Inside Container

**Location**: Inside container

```bash
# On host, execute inside container
podman exec -it auto-discovery-dev npm init playwright@latest

# Answer prompts (inside container):
# Where to put E2E tests? e2e
# Add GitHub Actions workflow? No
# Install Playwright browsers? Yes
```

**Expected Output**:
- `playwright.config.ts` created
- Browsers installed inside container
- Sample tests in `e2e/` directory

**Update `playwright.config.ts`** - edit on host at `frontend/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 }
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
```

---

### Step 8: Verify Basic Setup

**Location**: Inside container (execute from host)

Start the Angular dev server inside the container to verify everything works:

```bash
# On host machine, start dev server inside container
podman exec -it auto-discovery-dev npm start -- --host 0.0.0.0 --port 4200

# Expected output (from inside container):
# "✔ Browser application bundle generation complete"
# "** Angular Live Development Server is listening on 0.0.0.0:4200 **"
# "✔ Compiled successfully"
```

**Access**: Open browser to http://localhost:4200

**Expected**: Default Angular welcome page

**Press Ctrl+C to stop** (container keeps running)

**✅ Container-based workspace creation complete!**

---

## Phase 2: Project Structure and Configuration

**Location**: Host machine (editing configuration files)

**Note**: Edit these files on your host machine using your preferred editor. The container has already been created and is running from Phase 1.

### Step 9: Create Core Directory Structure

**Location**: Host machine (Thor)

Create the application directory structure:

```bash
# On host machine
cd /home/odin/projects/auto-discovery/frontend/src/app

# Create core directory structure
mkdir -p core/services
mkdir -p core/interceptors
mkdir -p core/guards

# Create features directory
mkdir -p features/discover
mkdir -p features/panel-popout

# Create shared directory
mkdir -p shared/components
mkdir -p shared/models
mkdir -p shared/pipes
mkdir -p shared/directives
```

**Note**: Simple directory creation - no container needed.

---

### Step 10: Configure TypeScript (Strict Mode)

**File**: `frontend/tsconfig.json` (edit on host)

Verify strict mode is enabled (should already be set from `ng new --strict`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

### Step 11: Configure Angular Build Budgets

**File**: `frontend/angular.json` (edit on host)

Update budgets to match specifications (5MB warning, 10MB error):

```json
{
  "configurations": {
    "production": {
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "5mb",
          "maximumError": "10mb"
        },
        {
          "type": "anyComponentStyle",
          "maximumWarning": "10kb",
          "maximumError": "20kb"
        }
      ]
    }
  }
}
```

---

### Step 12: Set Up PrimeNG Theme

**File**: `frontend/angular.json` (edit on host)

Add PrimeNG styles to build configuration:

```json
{
  "styles": [
    "node_modules/primeng/resources/themes/lara-light-red/theme.css",
    "node_modules/primeng/resources/primeng.min.css",
    "node_modules/primeicons/primeicons.css",
    "src/styles.scss"
  ]
}
```

**Note**: Using Material Red theme (lara-light-red) as specified

---

### Step 13: Create Environment Configurations

**File**: `frontend/src/environments/environment.ts` (edit on host)

```typescript
export const environment = {
  production: false,
  specsApiUrl: 'http://auto-discovery.minilab/api/specs/v1',
  vinsApiUrl: 'http://auto-discovery.minilab/api/vins/v1',
  authApiUrl: 'http://auto-discovery.minilab/api/auth/v1'
};
```

**File**: `frontend/src/environments/environment.prod.ts` (edit on host)

```typescript
export const environment = {
  production: true,
  specsApiUrl: '/api/specs/v1',
  vinsApiUrl: '/api/vins/v1',
  authApiUrl: '/api/auth/v1'
};
```

**Note**: The backend uses a microservices architecture with three independent services. Each service must be configured separately in the environment files.

### Step 13a: Understanding Microservices Architecture

**IMPORTANT**: The Auto Discovery backend uses a microservices architecture, not a monolithic API.

**Three Independent Services**:

1. **Specs API** (port 3000)
   - **Endpoint**: `/api/specs/v1/*`
   - **Purpose**: Vehicle specifications, manufacturer/model data, catalog queries, filtering
   - **Index**: `autos-unified` (4,887 vehicle specifications)
   - **Example endpoints**:
     - `GET /api/specs/v1/manufacturer-model-combinations`
     - `GET /api/specs/v1/filters/body-classes`
     - `GET /api/specs/v1/vehicles/details`

2. **VINs API** (port 3001)
   - **Endpoint**: `/api/vins/v1/*`
   - **Purpose**: Individual vehicle instances (VIN records)
   - **Index**: `autos-vins` (55,463 VIN records)
   - **Example endpoints**:
     - `GET /api/vins/v1/vins`
     - `GET /api/vins/v1/vehicles/:vehicleId/instances`

3. **Auth Service** (port 3002)
   - **Endpoint**: `/api/auth/v1/*`
   - **Purpose**: User authentication and authorization
   - **Method**: JWT-based token authentication
   - **Example endpoints**:
     - `POST /api/auth/v1/login`
     - `GET /api/auth/v1/user`
     - `POST /api/auth/v1/verify`
     - `POST /api/auth/v1/logout`

**Kubernetes Routing**: All services are accessible through a single ingress at `http://auto-discovery.minilab`, with path-based routing to the appropriate backend service.

**Frontend Implementation**: When creating Angular services (e.g., `VehicleService`, `AuthService`), inject the appropriate API URL from `environment.ts` based on which backend service you need to call.

**Example Service Usage**:
```typescript
// src/app/core/services/vehicle.service.ts
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private specsApiUrl = environment.specsApiUrl;

  getManufacturerModels(): Observable<any> {
    return this.http.get(`${this.specsApiUrl}/manufacturer-model-combinations`);
  }
}
```

---

## Phase 3: Development Workflow

**Container Status**: Your development container from Phase 1 should still be running. If not, restart it:

```bash
# Check if container is running
podman ps | grep auto-discovery-dev

# If not running, start it
podman start auto-discovery-dev
```

### Step 14: Start Daily Development Session

**Location**: Host machine (commands execute in container)

Start the Angular development server inside the container:

**Method 1 - Single Command** (recommended):

```bash
# On host machine, execute command inside container
podman exec -it auto-discovery-dev npm start -- --host 0.0.0.0 --port 4200
```

**Method 2 - Interactive Shell**:

```bash
# On host machine, enter container shell
podman exec -it auto-discovery-dev sh

# Now you're inside container - prompt changes to /app #
# Run commands inside container:
npm start -- --host 0.0.0.0 --port 4200
```

**Expected Output** (from inside container):
- "✔ Browser application bundle generation complete"
- "** Angular Live Development Server is listening on 0.0.0.0:4200 **"
- "✔ Compiled successfully"

**Access Points**:
- **From Thor**: http://localhost:4200
- **From network**: http://thor:4200 (if firewall allows)

**📝 Important Notes**:
- **Leave this terminal running** - this is your dev server
- **Hot Module Reloading (HMR)**: Edit files on host, see changes instantly in browser
- **Files edited on host** (VS Code) are immediately visible in container via volume mount
- **Press Ctrl+C** in this terminal to stop dev server (container keeps running)

**Example Workflow**:
```
Terminal 1 (host): podman exec -it auto-discovery-dev npm start ...
                   (Keep running - dev server)

Terminal 2 (host): vim frontend/src/app/app.component.ts
                   (Edit files - changes auto-reload)

Terminal 3 (host): podman exec auto-discovery-dev npm test
                   (Run tests as needed)

Browser:           http://localhost:4200
                   (See live updates)
```

---

## Phase 4: Production Build and Testing

### Step 15: Build Production Docker Image

**Location**: Host machine
**Directory**: `/home/odin/projects/auto-discovery`

Build the production image using the multi-stage Dockerfile:

```bash
# On host machine
cd /home/odin/projects/auto-discovery

# Build production image with Podman
podman build -f docs/Dockerfile -t localhost/auto-discovery-frontend:prod .

# OR with Docker:
docker build -f docs/Dockerfile -t auto-discovery-frontend:prod .
```

**Expected Output**:
- Stage 1: Node.js build (npm ci, ng build)
- Stage 2: nginx serve (copies dist/ to nginx)
- "Successfully tagged auto-discovery-frontend:prod"

**Time**: ~2-5 minutes depending on cache

**What happens**:
1. Stage 1 builds the Angular app in a Node.js container
2. Stage 2 copies only the built files to an nginx container
3. Final image is lightweight (nginx + static files only)

---

### Step 16: Test Production Image Locally

**Location**: Host machine

Run the production container to verify the build:

```bash
# On host machine
podman run -d --name auto-discovery-prod \
  -p 8080:80 \
  localhost/auto-discovery-frontend:prod

# OR with Docker:
docker run -d --name auto-discovery-prod \
  -p 8080:80 \
  auto-discovery-frontend:prod
```

**Access**: http://localhost:8080

**Verify**:
- Application loads correctly
- Static files served correctly
- SPA routing works (navigate, then refresh - should stay on route)
- Health check endpoint: http://localhost:8080/health

**Clean up**:

```bash
# On host machine
podman stop auto-discovery-prod
podman rm auto-discovery-prod

# OR with Docker:
docker stop auto-discovery-prod
docker rm auto-discovery-prod
```

---

## Phase 5: Daily Development Workflow

### Development Session Routine

**🔄 CONTAINER-BASED WORKFLOW**: Remember - you edit files on the host (Thor), but run all npm/ng commands inside the container.

**1. Start Development Session**:

**On host machine**:

```bash
# Check if dev container exists and is running
podman ps -a | grep auto-discovery-dev

# If not running, start it
cd /home/odin/projects/auto-discovery
podman run -d --name auto-discovery-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  localhost/auto-discovery-frontend:dev

# Verify container is running
podman ps | grep auto-discovery-dev
# Should show "Up" status

# Start Angular dev server (INSIDE container)
podman exec -it auto-discovery-dev npm start -- --host 0.0.0.0 --port 4200
```

**Expected**: Browser at http://localhost:4200 shows Angular app

**2. Edit Code** (Host Machine):

**All editing happens on the host** - use whatever editor you prefer:

```bash
# SSH into Thor (if remote)
ssh odin@thor

# Edit files with VS Code, vim, nano, etc.
code /home/odin/projects/auto-discovery/frontend/src/app/app.component.ts
# OR
vim /home/odin/projects/auto-discovery/frontend/src/app/app.component.ts
```

**What happens automatically**:
- ✅ Volume mount syncs changes into container instantly
- ✅ Angular dev server (running in container) detects changes
- ✅ HMR triggers automatic recompilation
- ✅ Browser refreshes automatically
- ✅ You see changes in seconds

**You NEVER edit files inside the container - always edit on host.**

**3. Run Tests** (Inside Container):

**From host machine**, execute commands inside container:

```bash
# Unit tests (in container)
podman exec -it auto-discovery-dev npm test

# Unit tests with coverage (in container)
podman exec -it auto-discovery-dev npm run test:coverage

# E2E tests (in container, requires app running)
podman exec -it auto-discovery-dev npm run e2e

# Run specific test file (in container)
podman exec -it auto-discovery-dev npm test -- --include='**/my.service.spec.ts'
```

**4. Generate Code** (Inside Container):

```bash
# From host, generate service (in container)
podman exec -it auto-discovery-dev ng generate service core/services/my-service

# From host, generate component (in container)
podman exec -it auto-discovery-dev ng generate component features/discover/my-component

# Files are created inside container but visible on host via volume mount
# Edit the generated files on host in your favorite editor
```

**5. Git Operations** (Host Machine):

**Git commands run on the host, NOT in container**:

```bash
# On host machine
cd /home/odin/projects/auto-discovery

git status
git add frontend/src/app/core/services/my-service.ts
git commit -m "feat(core): implement my service"
git push origin feature/my-feature
```

**6. End Session**:

```bash
# Stop dev server: Ctrl+C in terminal running npm start

# Container keeps running - you can restart dev server anytime:
podman exec -it auto-discovery-dev npm start -- --host 0.0.0.0 --port 4200

# Optional: Stop container (preserves container state)
podman stop auto-discovery-dev

# Optional: Remove container (requires rebuild with same command)
podman rm auto-discovery-dev
```

**💡 Pro Tips**:
- **Leave container running**: No need to stop/remove between sessions
- **Multiple terminals**: Terminal 1 for dev server, Terminal 2 for tests, Terminal 3 for git
- **Container persists**: `node_modules` and compiled files stay in container between restarts
- **Clean state**: If things get weird, `podman rm` and recreate container

---

### Building Production

**After completing features**:

```bash
# 1. Build production image
cd /home/odin/projects/auto-discovery
podman build -f docs/Dockerfile -t localhost/auto-discovery-frontend:v1.0.0 .

# 2. Test locally
podman run -d --name test-prod -p 8080:80 localhost/auto-discovery-frontend:v1.0.0
curl http://localhost:8080/health  # Should return "healthy"

# 3. Verify in browser
firefox http://localhost:8080

# 4. Clean up
podman stop test-prod
podman rm test-prod
```

---

## Development Tools

### VS Code Extensions (Recommended)

- Angular Language Service
- Prettier - Code formatter
- ESLint
- Angular Schematics
- GitLens
- Docker (or Podman)
- Playwright Test for VSCode

### VS Code Settings (workspace)

**File**: `frontend/.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Troubleshooting

### Dev Container Exits Immediately

**Symptom**:
```bash
podman ps | grep auto-discovery-dev
# No output
```

**Cause**: Container has no long-running process

**Solution**:
```bash
# Check logs
podman logs auto-discovery-dev

# Ensure Dockerfile.dev has: CMD ["tail", "-f", "/dev/null"]

# Remove and restart
podman rm auto-discovery-dev
podman run -d --name auto-discovery-dev --network host \
  -v $(pwd)/frontend:/app:z -w /app \
  localhost/auto-discovery-frontend:dev
```

---

### Permission Denied in Container

**Symptom**:
```bash
podman exec auto-discovery-dev npm start
# Error: EACCES: permission denied
```

**Cause**: Missing `:z` flag on volume mount (SELinux)

**Solution**:
```bash
# Restart with proper SELinux context
podman stop auto-discovery-dev
podman rm auto-discovery-dev
podman run -d --name auto-discovery-dev --network host \
  -v $(pwd)/frontend:/app:z \  # ← Note the :z flag
  -w /app localhost/auto-discovery-frontend:dev
```

---

### Bundle Size Exceeds Budget

**Symptom**:
```
Error: Bundle size exceeds 5 MB budget
```

**Solution**:

```bash
# Analyze bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json

# Optimize:
# - Enable lazy loading for feature modules
# - Use dynamic imports
# - Tree-shake unused code
# - Check for duplicate dependencies
```

---

### HMR Not Working

**Symptom**: File changes don't trigger recompilation

**Solutions**:

```bash
# 1. Ensure dev server uses correct host
npm start -- --host 0.0.0.0 --port 4200

# 2. Check volume mount is working
podman exec auto-discovery-dev ls /app
# Should list frontend files

# 3. Restart dev server
# Ctrl+C, then npm start again
```

---

## Access Points Summary

**Development**:
- **Frontend Dev**: http://localhost:4200
- **Backend API** (when implemented): http://localhost:3000/api/v1

**Production (local test)**:
- **Frontend Prod**: http://localhost:8080 (when container running)

---

## Next Steps

After environment setup:

1. **Read Specifications**: Start with [specs/README.md](../specs/README.md)
2. **Follow Roadmap**: See [ROADMAP.md](../ROADMAP.md) Phase 1 tasks
3. **Start Coding**: Begin with core services (UrlStateService, RequestCoordinatorService)
4. **Write Tests First**: Follow TDD approach from [specs/09-testing-strategy.md](../specs/09-testing-strategy.md)

---

**Document maintained by:** Auto Discovery Team
**Last verified:** 2025-11-15
**Version:** 1.0 (Initial Setup)
**Next review:** After Phase 1 completion
