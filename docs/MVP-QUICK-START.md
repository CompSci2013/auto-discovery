# MVP PICKER DEMO - QUICK START GUIDE
## Get Up and Running in 30 Minutes

**Audience**: Developers implementing the MVP
**Prerequisites**: Authentication/Authorization system in place, Angular 14 workspace set up

---

## WHAT YOU'LL BUILD

A working demo page (`/picker-demo`) showing two different picker configurations:

```
┌─────────────────────────────────────────────────────────┐
│  PICKER DEMO PAGE                                        │
├───────────────────────┬─────────────────────────────────┤
│ Single-Selection      │ Dual-Hierarchy                  │
│ Picker                │ Picker                          │
│                       │                                 │
│ Body Class Filter     │ Manufacturer-Model Filter       │
│ ☐ Sedan (1234)        │ ☐ Ford  ☐ F-150 (523)          │
│ ☐ SUV (987)           │ ☐ Ford  ☐ Mustang (412)        │
│ ☐ Truck (654)         │ ☐ Toyota ☐ Camry (678)         │
│                       │                                 │
│ [Select] [Clear]      │ [Select] [Clear]                │
└───────────────────────┴─────────────────────────────────┘

URL: /picker-demo?bodyClass=Sedan,SUV&modelCombos=Ford:F-150,Toyota:Camry
```

---

## 5-STEP IMPLEMENTATION

### STEP 1: Create Core Models (5 minutes)

**File**: `src/app/shared/models/picker-config.model.ts`

Copy the `PickerConfig` interface from the [MVP spec](./MVP-PICKER-DEMO.md#41-pickerconfig-interface), section 4.1.

```bash
# Create directory structure
mkdir -p src/app/shared/models
mkdir -p src/app/shared/configs
mkdir -p src/app/shared/components/base-picker
mkdir -p src/app/features/picker-demo
```

### STEP 2: Create Picker Configurations (10 minutes)

**File 1**: `src/app/shared/configs/body-class-picker.config.ts`

```typescript
import { PickerConfig } from '../models/picker-config.model';

export interface BodyClass {
  bodyClass: string;
  count: number;
}

export const BODY_CLASS_PICKER_CONFIG: PickerConfig<BodyClass> = {
  id: 'body-class',
  title: 'Select Body Classes',
  columns: [
    { key: 'bodyClass', label: 'Body Class', sortable: true, width: '300px' },
    { key: 'count', label: 'Count', sortable: true, width: '100px', align: 'right' }
  ],
  api: {
    endpoint: '/api/specs/v1/filters/body-classes',
    method: 'GET',
    paginationMode: 'client',
    searchParam: 'search',
    responseTransformer: (response: any) => ({
      results: response.data.map((item: any) => ({
        bodyClass: item.value,
        count: item.count
      })),
      total: response.data.length
    })
  },
  row: {
    keyGenerator: (row: BodyClass) => row.bodyClass
  },
  selection: {
    mode: 'multiple',
    urlParam: 'bodyClass',
    serializer: (items: BodyClass[]) => items.map(i => i.bodyClass).join(','),
    deserializer: (urlValue: string) => urlValue.split(',').filter(v => v.length > 0)
  },
  search: {
    enabled: true,
    placeholder: 'Search body classes...',
    fields: ['bodyClass'],
    debounceMs: 300
  },
  ui: {
    showSearch: true,
    showPagination: false,
    emptyMessage: 'No body classes found',
    loadingMessage: 'Loading body classes...'
  }
};
```

**File 2**: `src/app/shared/configs/manufacturer-model-picker.config.ts`

Copy the `MANUFACTURER_MODEL_PICKER_CONFIG` from [MVP spec section 3.2](./MVP-PICKER-DEMO.md#32-manufacturer-model-picker-dual-selection).

### STEP 3: Implement BasePickerComponent (10 minutes)

**Files**:
- `src/app/shared/components/base-picker/base-picker.component.ts`
- `src/app/shared/components/base-picker/base-picker.component.html`
- `src/app/shared/components/base-picker/base-picker.component.scss`

Copy the complete component code from [MVP spec section 4.2](./MVP-PICKER-DEMO.md#42-basepickercomponent).

**Register in Module**:
```typescript
// src/app/shared/shared.module.ts
@NgModule({
  declarations: [BasePickerComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TableModule,      // PrimeNG
    CheckboxModule,   // PrimeNG
    InputTextModule,  // PrimeNG
    ButtonModule,     // PrimeNG
    ProgressSpinnerModule  // PrimeNG
  ],
  exports: [BasePickerComponent]
})
export class SharedModule { }
```

### STEP 4: Create Demo Page (10 minutes)

**Files**:
- `src/app/features/picker-demo/picker-demo.component.ts`
- `src/app/features/picker-demo/picker-demo.component.html`

Copy from [MVP spec section 5](./MVP-PICKER-DEMO.md#5-demo-page-component).

**Register Route**:
```typescript
// src/app/app-routing.module.ts
{
  path: 'picker-demo',
  component: PickerDemoComponent,
  canActivate: [AuthGuard],
  data: {
    requiredRole: 'viewer',
    breadcrumb: 'Picker Demo'
  }
}
```

### STEP 5: Test & Run (5 minutes)

```bash
# Start dev server
ng serve

# Navigate to demo page
# http://localhost:4200/picker-demo

# Test functionality:
# 1. Click "Select Body Classes" → choose items → Apply
# 2. Verify URL updates: ?bodyClass=Sedan,SUV
# 3. Click "Select Manufacturer-Model" → choose items → Apply
# 4. Verify URL updates: ?modelCombos=Ford:F-150,Toyota:Camry
# 5. Refresh page → verify selections are restored from URL
```

---

## CONFIGURATION REFERENCE

### Quick Configuration Template

```typescript
export const MY_PICKER_CONFIG: PickerConfig<MyDataType> = {
  id: 'my-picker',
  title: 'Select Items',

  columns: [
    { key: 'fieldName', label: 'Display Label', sortable: true }
  ],

  api: {
    endpoint: '/api/specs/v1/my-endpoint',  // or /api/vins/v1/ or /api/auth/v1/
    method: 'GET',
    paginationMode: 'server',  // or 'client'
    responseTransformer: (res) => ({
      results: res.data,
      total: res.total
    })
  },

  row: {
    keyGenerator: (row) => row.id
  },

  selection: {
    mode: 'multiple',
    urlParam: 'myParam',
    serializer: (items) => items.map(i => i.id).join(','),
    deserializer: (url) => url.split(',').map(id => ({ id }))
  },

  search: {
    enabled: true,
    placeholder: 'Search...',
    fields: ['fieldName']
  },

  ui: {
    showSearch: true,
    showPagination: true
  }
};
```

---

## TROUBLESHOOTING

### Issue: Picker doesn't load data

**Solution**: Check API endpoint and response format
```typescript
// Add console logging to responseTransformer
responseTransformer: (response: any) => {
  console.log('API Response:', response);
  return { results: response.data, total: response.total };
}
```

### Issue: Selections not reflected in URL

**Solution**: Verify serializer function
```typescript
// Test serializer independently
const items = [{ bodyClass: 'Sedan' }, { bodyClass: 'SUV' }];
const urlValue = config.selection.serializer(items);
console.log('URL Value:', urlValue);  // Should be: "Sedan,SUV"
```

### Issue: Page refresh loses selections

**Solution**: Check URL hydration in demo component
```typescript
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    console.log('URL Params:', params);
    // Ensure initialSelections are passed to picker
  });
}
```

---

## MOCK API (If Backend Not Ready)

Create mock service for development:

```typescript
// src/app/shared/services/mock-api.interceptor.ts
@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Body Class mock
    if (req.url.includes('/api/specs/v1/filters/body-classes')) {
      return of(new HttpResponse({
        status: 200,
        body: {
          success: true,
          data: [
            { value: 'Sedan', count: 1234 },
            { value: 'SUV', count: 987 },
            { value: 'Truck', count: 654 },
            { value: 'Coupe', count: 432 },
            { value: 'Wagon', count: 321 }
          ]
        }
      })).pipe(delay(300));
    }

    // Manufacturer-Model mock
    if (req.url.includes('/api/specs/v1/manufacturer-model-combinations')) {
      const page = parseInt(req.params.get('page') || '1', 10);
      const size = parseInt(req.params.get('size') || '20', 10);

      const allData = [
        { manufacturer: 'Ford', model: 'F-150', count: 523 },
        { manufacturer: 'Ford', model: 'Mustang', count: 412 },
        { manufacturer: 'Ford', model: 'Explorer', count: 389 },
        { manufacturer: 'Toyota', model: 'Camry', count: 678 },
        { manufacturer: 'Toyota', model: 'Corolla', count: 591 },
        { manufacturer: 'Honda', model: 'Civic', count: 445 },
        // Add more...
      ];

      const start = (page - 1) * size;
      const end = start + size;

      return of(new HttpResponse({
        status: 200,
        body: {
          success: true,
          results: allData.slice(start, end),
          total: allData.length,
          page,
          totalPages: Math.ceil(allData.length / size)
        }
      })).pipe(delay(500));
    }

    return next.handle(req);
  }
}

// Register in app.module.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: MockApiInterceptor, multi: true }
]
```

---

## NEXT STEPS

After MVP is working:

1. **Add DualCheckboxPickerComponent** for hierarchical selection (see full MVP spec)
2. **Expand to more picker types** (year range, data source, etc.)
3. **Integrate with full Discover page**
4. **Add user preferences persistence** (Phase 2)
5. **Implement remaining features** per roadmap

---

## GETTING HELP

- **Full MVP Specification**: See [MVP-PICKER-DEMO.md](./MVP-PICKER-DEMO.md)
- **Configuration Examples**: See section 3 of MVP spec
- **API Integration**: See section 7 of MVP spec
- **Testing Guide**: See section 8 of MVP spec

---

**Ready to build!** Follow the 5 steps above and you'll have a working picker demo in ~30 minutes.
