# Contributing Guide
## Auto Discovery Development Guidelines

**Project**: Auto Discovery (Vehicle Discovery Platform)
**Approach**: Specification-Driven Development
**Standards**: High code quality, comprehensive testing

---

## BEFORE YOU START

### 1. Read the Specifications

**Required Reading**:
- [specs/README.md](./specs/README.md) - Specification index
- [specs/01-architectural-analysis.md](./specs/01-architectural-analysis.md) - System overview
- Relevant spec for your feature

**Rule**: Never start coding without reading the relevant specification first.

### 2. Check the Roadmap

- Review [ROADMAP.md](./ROADMAP.md) to find available tasks
- Ensure you understand dependencies
- Update task status when you start work

### 3. Set Up Your Environment

Follow [GETTING-STARTED.md](./GETTING-STARTED.md) for complete setup instructions.

---

## DEVELOPMENT WORKFLOW

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b <type>/<feature-name>
```

**Branch Naming**:
- `feat/url-state-service` - New feature
- `fix/table-sorting-bug` - Bug fix
- `docs/api-documentation` - Documentation
- `test/e2e-popout-tests` - Tests
- `refactor/chart-components` - Refactoring
- `perf/bundle-optimization` - Performance

### 2. Code to Specification

**Always**:
- ✅ Follow exact method signatures from specs
- ✅ Use exact interface definitions
- ✅ Match behavior described in specs
- ✅ Include code examples from specs

**Never**:
- ❌ Deviate from spec without documentation
- ❌ Reference original source code
- ❌ "Improve" spec design without team discussion

**If Spec is Ambiguous**:
1. Create an issue documenting the ambiguity
2. Discuss with team
3. Document decision in issue and code comments
4. Continue with agreed interpretation

### 3. Commit Standards

**Use Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `style`: Formatting, no code change
- `chore`: Build, CI, dependencies

**Scopes** (optional but recommended):
- `core`: Core services
- `discover`: Discover feature
- `filters`: Filter system
- `pickers`: Picker components
- `charts`: Chart components
- `popout`: Pop-out window system
- `test`: Testing infrastructure

**Example**:

```bash
git commit -m "feat(core): implement RequestCoordinatorService

Implements 3-layer request processing:
- Cache layer with 5-minute TTL
- Request deduplication for concurrent calls
- HTTP retry with exponential backoff (3 attempts)

Includes:
- 30+ unit tests covering all scenarios
- Mock HTTP backend for testing
- Integration with ErrorInterceptor

Ref: specs/04-state-management-specification.md section 3"
```

### 4. Create Pull Request

**PR Title**: Same as commit message (if single commit)

**PR Description Template**:

```markdown
## Summary
Brief description of changes

## Specification Reference
- [Spec 04 - State Management](./specs/04-state-management-specification.md), section 3
- Implements RequestCoordinatorService as specified

## Changes
- Added RequestCoordinatorService
- Added 30 unit tests
- Integrated with ApiService

## Testing
- [x] Unit tests pass (npm test)
- [x] E2E tests pass (npm run e2e)
- [x] Coverage > 80% for new code
- [x] Manual testing completed

## Checklist
- [x] Code follows specification exactly
- [x] All tests pass
- [x] TypeScript strict mode clean
- [x] ESLint passing
- [x] Documentation updated
- [x] No console.log or debugger statements
```

---

## CODE QUALITY STANDARDS

### TypeScript

**Strict Mode** (enabled):

```typescript
// ✅ Good
public getQueryParam(key: string): string | null {
  const value = this.route.snapshot.queryParams[key];
  return value ?? null;
}

// ❌ Bad
public getQueryParam(key: any): any {
  return this.route.snapshot.queryParams[key];
}
```

**No `any` Type**:

```typescript
// ✅ Good
interface TableConfig<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

// ❌ Bad
interface TableConfig {
  columns: any[];
  data: any[];
}
```

**Explicit Return Types**:

```typescript
// ✅ Good: Explicit return type, uses environment config
public fetchVehicles(): Observable<VehicleResult[]> {
  return this.http.get<ApiResponse>(`${environment.specsApiUrl}/vehicles/details`)
    .pipe(map(response => response.results));
}

// ❌ Bad: Inferred return type, hardcoded URL
public fetchVehicles() {
  return this.http.get('/api/vehicles')
    .pipe(map(response => response.results));
}
```

**Note**: The backend uses a microservices architecture. Always use environment configuration:
- `environment.specsApiUrl` - Vehicle specifications and catalog queries
- `environment.vinsApiUrl` - VIN records and vehicle instances
- `environment.authApiUrl` - Authentication and authorization

### Testing

**Coverage Requirements**:
- Services: 80% minimum, 90% target
- Components: 70% minimum, 85% target
- Overall: 75% minimum, 85% target

**Test Structure** (Arrange-Act-Assert):

```typescript
it('should cache request for 5 minutes', fakeAsync(() => {
  // Arrange
  const requestFn = () => of({ data: 'test' });

  // Act - First call
  service.execute('test-key', requestFn).subscribe();
  tick();

  // Assert - Should use cache on second call
  let cacheHit = false;
  service.execute('test-key', requestFn).subscribe(() => {
    cacheHit = true;
  });
  tick();

  expect(cacheHit).toBe(true);

  // Act - Advance time beyond TTL
  tick(5 * 60 * 1000 + 1);

  // Assert - Should make new request
  service.execute('test-key', requestFn).subscribe();
  tick();
  // (verify new request was made)
}));
```

**Test Naming**:

```typescript
// ✅ Good: Descriptive, states expected behavior
it('should return null when query parameter does not exist')
it('should deduplicate concurrent requests to same endpoint')
it('should retry failed requests up to 3 times with exponential backoff')

// ❌ Bad: Vague, doesn't describe behavior
it('should work')
it('test get param')
it('handles requests')
```

### Component Guidelines

**OnPush Change Detection**:

```typescript
@Component({
  selector: 'app-results-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ResultsTableComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  updateData(newData: VehicleResult[]): void {
    this.data = newData;
    this.cdr.markForCheck();  // Required for OnPush
  }
}
```

**Unsubscribe Pattern**:

```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.stateService.state$
    .pipe(takeUntil(this.destroy$))
    .subscribe(state => {
      // Handle state
    });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### File Organization

**Co-locate Tests**:

```
src/app/core/services/
  ├── url-state.service.ts
  ├── url-state.service.spec.ts      # ✅ Co-located
  ├── request-coordinator.service.ts
  └── request-coordinator.service.spec.ts
```

**File Size Limits**:
- Components: < 400 lines
- Services: < 800 lines
- Templates: < 200 lines
- Test files: No limit (comprehensive tests preferred)

---

## DOCUMENTATION

### JSDoc Comments

**Required For**:
- All public methods
- All interfaces
- All classes
- Complex algorithms

**Example**:

```typescript
/**
 * Manages URL-based state synchronization.
 *
 * Provides methods to read and write query parameters while maintaining
 * Angular router state. All updates are performed asynchronously and
 * return Observables for proper handling.
 *
 * @example
 * ```typescript
 * urlState.setQueryParams({ manufacturer: 'Ford' }).subscribe(() => {
 *   console.log('URL updated');
 * });
 * ```
 *
 * Specification: specs/04-state-management-specification.md section 2
 */
@Injectable()
export class UrlStateService {
  /**
   * Updates query parameters in the URL.
   *
   * @param params - Key-value pairs to set in URL
   * @param mode - 'merge' to keep existing params, 'replace' to reset
   * @returns Observable that emits true when navigation completes
   */
  public setQueryParams(
    params: Params,
    mode: 'merge' | 'replace' = 'merge'
  ): Observable<boolean> {
    // Implementation
  }
}
```

### Code Comments

**When to Comment**:
- Complex algorithms
- Non-obvious workarounds
- Specification deviations
- Performance optimizations

```typescript
// SPEC DEVIATION: Specification calls for 3 retries, but API
// documentation indicates 5 retries is standard. Using 5.
// See: https://api.example.com/docs/retry-policy
// Issue: #42
private maxRetries = 5;
```

**When NOT to Comment**:
- Obvious code (don't state what code does)
- Redundant JSDoc

```typescript
// ❌ Bad: Obvious
// Set manufacturer to Ford
this.manufacturer = 'Ford';

// ✅ Good: Explains WHY
// Pre-select Ford as default manufacturer per UX requirements
// to reduce clicks for most common use case
this.manufacturer = 'Ford';
```

---

## CODE REVIEW

### For Authors

**Before Requesting Review**:
- [ ] All tests pass locally
- [ ] Code coverage meets minimum (75%)
- [ ] ESLint passing with no warnings
- [ ] TypeScript compiles with strict mode
- [ ] Manual testing completed
- [ ] Specification references in PR description
- [ ] No console.log or debugger statements
- [ ] No commented-out code

### For Reviewers

**Review Checklist**:
- [ ] Code matches specification exactly
- [ ] Tests are comprehensive
- [ ] No security vulnerabilities (XSS, injection)
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Error handling present
- [ ] Documentation adequate

**Review Comments**:

```markdown
# ✅ Good review comment
The `getVehicles()` method doesn't match the specification's signature.

Per specs/02-api-contracts-data-models.md section 2.1, it should accept
`SearchFilters` as a parameter, not individual filter fields.

Expected:
```typescript
getVehicles(filters: SearchFilters): Observable<ApiResponse>
```

Current:
```typescript
getVehicles(manufacturer?: string, model?: string): Observable<ApiResponse>
```

# ❌ Bad review comment
This is wrong, fix it.
```

---

## PERFORMANCE GUIDELINES

### Bundle Size

**Monitor Bundle Size**:

```bash
# Analyze bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json
```

**Lazy Loading**:

```typescript
// ✅ Good: Lazy load feature modules
const routes: Routes = [
  {
    path: 'discover',
    loadChildren: () => import('./features/discover/discover.module')
      .then(m => m.DiscoverModule)
  }
];

// ❌ Bad: Eager load everything
import { DiscoverModule } from './features/discover/discover.module';
```

### Change Detection

**Use OnPush Everywhere**:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush  // ✅ Required
})
```

---

## ACCESSIBILITY

### Requirements (WCAG 2.1 Level AA)

**Keyboard Navigation**:

```html
<!-- ✅ Good: Keyboard accessible -->
<button (click)="apply()" (keydown.enter)="apply()">
  Apply
</button>

<!-- ❌ Bad: Mouse only -->
<div (click)="apply()">Apply</div>
```

**ARIA Labels**:

```html
<!-- ✅ Good: Screen reader accessible -->
<button aria-label="Close dialog" (click)="close()">
  <i class="pi pi-times"></i>
</button>

<!-- ❌ Bad: No label for icon button -->
<button (click)="close()">
  <i class="pi pi-times"></i>
</button>
```

**Color Contrast**:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

---

## COMMON MISTAKES TO AVOID

### 1. Not Reading Specifications

❌ **Wrong**: Start coding based on assumptions

✅ **Right**: Read spec → understand → implement

### 2. Inadequate Testing

❌ **Wrong**: Write code without tests or with minimal coverage

✅ **Right**: Write comprehensive tests to meet coverage requirements (75%+ overall)

### 3. Using `any` Type

❌ **Wrong**: `data: any`

✅ **Right**: `data: VehicleResult[]`

### 4. Forgetting Unsubscribe

❌ **Wrong**: Subscribe without cleanup → memory leak

✅ **Right**: Use `takeUntil(destroy$)` pattern

### 5. Skipping E2E Tests

❌ **Wrong**: Only unit tests

✅ **Right**: Unit tests + E2E tests for critical paths

---

## QUESTIONS?

1. **Check Specifications**: Answer is usually there
2. **Check Existing Code**: See patterns in use
3. **Create Issue**: Document question
4. **Ask Team**: Discuss interpretation

---

## THANK YOU FOR CONTRIBUTING!

Your adherence to these guidelines ensures:
- ✅ High code quality
- ✅ Specification fidelity
- ✅ Maintainable codebase
- ✅ Successful project delivery

---

*Happy coding! 🚀*
