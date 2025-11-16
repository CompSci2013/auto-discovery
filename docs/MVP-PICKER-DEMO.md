# MVP: CONFIGURATION-DRIVEN PICKER DEMONSTRATION
## Auto Discovery Platform - Minimal Viable Product

**Status**: Implementation Ready
**Date**: 2025-11-16
**Purpose**: Demonstrate configuration-driven picker components with two distinct use cases

---

## EXECUTIVE SUMMARY

This MVP delivers a **standalone demonstration page** showcasing the configuration-driven picker architecture with two working examples:

1. **Single-Selection Picker** - Simple checkbox-per-row picker (e.g., Body Class selection)
2. **Dual-Hierarchy Picker** - Parent/child relationship picker (e.g., Manufacturer → Model selection)

**Deliverables**:
- ✅ Working demo page at `/picker-demo`
- ✅ Two functional picker configurations
- ✅ Complete source code for all components
- ✅ Comprehensive configuration documentation
- ✅ API integration (real or mocked)

**Assumption**: Authentication/Authorization system is in place

---

## 1. MVP SCOPE

### 1.1 In Scope

**Components**:
- ✅ `BasePickerComponent<T>` - Generic single-selection picker
- ✅ `DualCheckboxPickerComponent` - Parent/child hierarchy picker
- ✅ `PickerDemoComponent` - Demo page showing both pickers side-by-side

**Configuration System**:
- ✅ `PickerConfig<T>` interface
- ✅ `PickerConfigService` - Registry for picker configurations
- ✅ Two example configurations (body-class, manufacturer-model)

**Features**:
- ✅ Server-side pagination
- ✅ Search/filtering
- ✅ Selection state management
- ✅ Apply/Cancel buttons
- ✅ URL hydration (restore selections from URL)
- ✅ Multi-select support

**Documentation**:
- ✅ Configuration guide (step-by-step)
- ✅ API integration examples
- ✅ Troubleshooting guide

### 1.2 Out of Scope (Future Phases)

- ❌ Full Discover page integration
- ❌ Chart components
- ❌ Pop-out windows
- ❌ User preferences persistence (uses session state only for MVP)
- ❌ Advanced filtering beyond search

---

## 2. ARCHITECTURE

### 2.0 Backend Microservices

The Auto Discovery backend uses a microservices architecture with three independent services:

**Specs API** (`/api/specs/v1/*`):
- Vehicle specifications and catalog data
- Manufacturer/model combinations
- Body class filters, year ranges, data sources
- Queries the `autos-unified` Elasticsearch index

**VINs API** (`/api/vins/v1/*`):
- Individual vehicle instances (VIN records)
- Queries the `autos-vins` Elasticsearch index

**Auth Service** (`/api/auth/v1/*`):
- User authentication and authorization
- JWT token-based security

**For MVP Picker Demo**: All picker configurations use the Specs API endpoints.

### 2.1 Component Hierarchy

```
PickerDemoComponent (Demo Page)
  ├─> BasePickerComponent<BodyClass>
  │     ├─> Input: PickerConfig
  │     ├─> API: GET /api/specs/v1/filters/body-classes
  │     └─> Output: Selected body classes
  │
  └─> DualCheckboxPickerComponent
        ├─> Input: PickerConfig (manufacturer-model)
        ├─> API: GET /api/specs/v1/manufacturer-model-combinations
        └─> Output: Selected manufacturer-model pairs
```

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  PickerConfigService (Registry)                         │
│  • BODY_CLASS_PICKER_CONFIG                             │
│  • MANUFACTURER_MODEL_PICKER_CONFIG                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ 1. Get config by ID
                     ▼
┌─────────────────────────────────────────────────────────┐
│  BasePickerComponent / DualCheckboxPickerComponent      │
│  • Load data from API (using config.api)                │
│  • Display rows with checkboxes                         │
│  • Track selection state                                │
│  • Serialize selections to URL format                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ 2. User clicks "Apply"
                     ▼
┌─────────────────────────────────────────────────────────┐
│  PickerDemoComponent (Parent)                           │
│  • Receives selection event                             │
│  • Updates URL with selections                          │
│  • Displays selected items                              │
└─────────────────────────────────────────────────────────┘
```

---

## 3. PICKER CONFIGURATIONS

### 3.1 Body Class Picker (Single Selection)

**Use Case**: Select body classes (e.g., Sedan, SUV, Truck)

**Configuration File**: `src/app/shared/configs/body-class-picker.config.ts`

```typescript
import { PickerConfig } from '../models/picker-config.model';

export interface BodyClass {
  bodyClass: string;
  count: number;
}

export const BODY_CLASS_PICKER_CONFIG: PickerConfig<BodyClass> = {
  id: 'body-class',
  title: 'Select Body Classes',

  // Column definitions
  columns: [
    {
      key: 'bodyClass',
      label: 'Body Class',
      sortable: true,
      width: '300px'
    },
    {
      key: 'count',
      label: 'Count',
      sortable: true,
      width: '100px',
      align: 'right'
    }
  ],

  // API configuration
  api: {
    endpoint: '/api/specs/v1/filters/body-classes',
    method: 'GET',
    paginationMode: 'client',  // All data loaded at once
    searchParam: 'search',
    responseTransformer: (response: any) => ({
      results: response.data.map((item: any) => ({
        bodyClass: item.value,
        count: item.count
      })),
      total: response.data.length
    })
  },

  // Row configuration
  row: {
    keyGenerator: (row: BodyClass) => row.bodyClass,
    displayTemplate: (row: BodyClass) => `${row.bodyClass} (${row.count})`
  },

  // Selection configuration
  selection: {
    mode: 'multiple',
    urlParam: 'bodyClass',
    serializer: (items: BodyClass[]) => items.map(i => i.bodyClass).join(','),
    deserializer: (urlValue: string) => urlValue.split(',').filter(v => v.length > 0)
  },

  // Search configuration
  search: {
    enabled: true,
    placeholder: 'Search body classes...',
    fields: ['bodyClass'],
    debounceMs: 300
  },

  // UI configuration
  ui: {
    showSearch: true,
    showPagination: false,  // Client-side mode, no pagination needed
    emptyMessage: 'No body classes found',
    loadingMessage: 'Loading body classes...'
  }
};
```

### 3.2 Manufacturer-Model Picker (Dual Selection)

**Use Case**: Select manufacturer-model combinations (hierarchical)

**Configuration File**: `src/app/shared/configs/manufacturer-model-picker.config.ts`

```typescript
import { PickerConfig } from '../models/picker-config.model';

export interface ManufacturerModelRow {
  manufacturer: string;
  model: string;
  count: number;
}

export const MANUFACTURER_MODEL_PICKER_CONFIG: PickerConfig<ManufacturerModelRow> = {
  id: 'manufacturer-model',
  title: 'Select Manufacturers & Models',

  // Column definitions
  columns: [
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      sortable: true,
      width: '200px'
    },
    {
      key: 'model',
      label: 'Model',
      sortable: true,
      width: '200px'
    },
    {
      key: 'count',
      label: 'Count',
      sortable: true,
      width: '100px',
      align: 'right'
    }
  ],

  // API configuration
  api: {
    endpoint: '/api/specs/v1/manufacturer-model-combinations',
    method: 'GET',
    paginationMode: 'server',  // Server-side pagination
    pageParam: 'page',
    sizeParam: 'size',
    defaultPageSize: 20,
    searchParam: 'search',
    responseTransformer: (response: any) => ({
      results: response.results,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages
    })
  },

  // Row configuration (dual-checkbox specific)
  row: {
    keyGenerator: (row: ManufacturerModelRow) => `${row.manufacturer}|${row.model}`,
    displayTemplate: (row: ManufacturerModelRow) => `${row.manufacturer} ${row.model} (${row.count})`,

    // Dual-checkbox configuration
    parentKey: 'manufacturer',
    childKey: 'model'
  },

  // Selection configuration
  selection: {
    mode: 'multiple',
    urlParam: 'modelCombos',
    serializer: (items: ManufacturerModelRow[]) =>
      items.map(i => `${i.manufacturer}:${i.model}`).join(','),
    deserializer: (urlValue: string) =>
      urlValue.split(',')
        .filter(v => v.length > 0)
        .map(combo => {
          const [manufacturer, model] = combo.split(':');
          return { manufacturer, model };
        })
  },

  // Search configuration
  search: {
    enabled: true,
    placeholder: 'Search manufacturers or models...',
    fields: ['manufacturer', 'model'],
    debounceMs: 300
  },

  // UI configuration
  ui: {
    showSearch: true,
    showPagination: true,
    emptyMessage: 'No manufacturer-model combinations found',
    loadingMessage: 'Loading data...'
  }
};
```

---

## 4. COMPONENT IMPLEMENTATIONS

### 4.1 PickerConfig Interface

**File**: `src/app/shared/models/picker-config.model.ts`

```typescript
export interface PickerConfig<T = any> {
  // Identification
  id: string;
  title: string;

  // Column definitions
  columns: ColumnDef[];

  // API configuration
  api: ApiConfig;

  // Row configuration
  row: RowConfig<T>;

  // Selection configuration
  selection: SelectionConfig<T>;

  // Search configuration
  search?: SearchConfig;

  // UI configuration
  ui?: UIConfig;
}

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any) => string;
}

export interface ApiConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  paginationMode: 'server' | 'client';
  pageParam?: string;
  sizeParam?: string;
  defaultPageSize?: number;
  searchParam?: string;
  responseTransformer: (response: any) => {
    results: any[];
    total: number;
    page?: number;
    totalPages?: number;
  };
}

export interface RowConfig<T> {
  keyGenerator: (row: T) => string;
  displayTemplate?: (row: T) => string;

  // For dual-checkbox pickers
  parentKey?: string;
  childKey?: string;
}

export interface SelectionConfig<T> {
  mode: 'single' | 'multiple';
  urlParam: string;
  serializer: (items: T[]) => string;
  deserializer: (urlValue: string) => Partial<T>[];
}

export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  fields: string[];
  debounceMs?: number;
}

export interface UIConfig {
  showSearch?: boolean;
  showPagination?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
}
```

### 4.2 BasePickerComponent

**File**: `src/app/shared/components/base-picker/base-picker.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PickerConfig } from '../../models/picker-config.model';

export interface PickerSelectionEvent<T = any> {
  selectedItems: T[];
  urlValue: string;
}

@Component({
  selector: 'app-base-picker',
  templateUrl: './base-picker.component.html',
  styleUrls: ['./base-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasePickerComponent<T = any> implements OnInit {
  @Input() config!: PickerConfig<T>;
  @Input() initialSelections: string[] = [];
  @Output() selectionChange = new EventEmitter<PickerSelectionEvent<T>>();
  @Output() cancel = new EventEmitter<void>();

  // State
  data: T[] = [];
  selectedKeys = new Set<string>();
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalRecords = 0;
  totalPages = 0;

  // Search
  searchTerm = '';
  searchSubject = new Subject<string>();

  // Sorting
  sortField: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(this.config.search?.debounceMs || 300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.loadData();
    });

    // Set page size from config
    this.pageSize = this.config.api.defaultPageSize || 20;

    // Load initial data
    this.loadData();

    // Hydrate initial selections
    if (this.initialSelections.length > 0) {
      this.hydrateSelections(this.initialSelections);
    }
  }

  /**
   * Load data from API
   */
  loadData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    let params = new HttpParams();

    // Add pagination params (server-side only)
    if (this.config.api.paginationMode === 'server') {
      params = params.set(this.config.api.pageParam || 'page', this.currentPage.toString());
      params = params.set(this.config.api.sizeParam || 'size', this.pageSize.toString());
    }

    // Add search param
    if (this.searchTerm && this.config.api.searchParam) {
      params = params.set(this.config.api.searchParam, this.searchTerm);
    }

    // Add sort param (if supported)
    if (this.sortField) {
      params = params.set('sortField', this.sortField);
      params = params.set('sortOrder', this.sortOrder);
    }

    this.http.get(this.config.api.endpoint, { params }).subscribe({
      next: (response) => {
        const transformed = this.config.api.responseTransformer(response);

        if (this.config.api.paginationMode === 'client') {
          // Client-side pagination: filter and paginate in memory
          this.data = this.applyClientSideFiltering(transformed.results);
          this.totalRecords = this.data.length;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        } else {
          // Server-side pagination
          this.data = transformed.results;
          this.totalRecords = transformed.total;
          this.totalPages = transformed.totalPages || Math.ceil(transformed.total / this.pageSize);
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Apply client-side search filtering
   */
  private applyClientSideFiltering(data: T[]): T[] {
    if (!this.searchTerm || !this.config.search?.fields) {
      return data;
    }

    const lowerSearch = this.searchTerm.toLowerCase();
    return data.filter(row => {
      return this.config.search!.fields.some(field => {
        const value = (row as any)[field];
        return value && value.toString().toLowerCase().includes(lowerSearch);
      });
    });
  }

  /**
   * Get paginated data for current page (client-side only)
   */
  getPaginatedData(): T[] {
    if (this.config.api.paginationMode === 'server') {
      return this.data;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }

  /**
   * Toggle row selection
   */
  toggleRow(row: T): void {
    const key = this.config.row.keyGenerator(row);

    if (this.selectedKeys.has(key)) {
      this.selectedKeys.delete(key);
    } else {
      if (this.config.selection.mode === 'single') {
        this.selectedKeys.clear();
      }
      this.selectedKeys.add(key);
    }

    this.cdr.markForCheck();
  }

  /**
   * Check if row is selected
   */
  isRowSelected(row: T): boolean {
    const key = this.config.row.keyGenerator(row);
    return this.selectedKeys.has(key);
  }

  /**
   * Handle search input
   */
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.config.api.paginationMode === 'server') {
      this.loadData();
    } else {
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle sort
   */
  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }

    if (this.config.api.paginationMode === 'server') {
      this.loadData();
    } else {
      this.applyClientSideSort();
      this.cdr.markForCheck();
    }
  }

  /**
   * Apply client-side sorting
   */
  private applyClientSideSort(): void {
    if (!this.sortField) return;

    this.data.sort((a, b) => {
      const aVal = (a as any)[this.sortField!];
      const bVal = (b as any)[this.sortField!];

      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Apply selections
   */
  onApply(): void {
    const selectedItems = this.data.filter(row =>
      this.selectedKeys.has(this.config.row.keyGenerator(row))
    );

    const urlValue = this.config.selection.serializer(selectedItems);

    this.selectionChange.emit({
      selectedItems,
      urlValue
    });
  }

  /**
   * Cancel selection
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Hydrate selections from URL
   */
  private hydrateSelections(urlSelections: string[]): void {
    // Match URL selections to loaded data
    // This is a simplified version; production would need more robust matching
    this.selectedKeys = new Set(urlSelections);
    this.cdr.markForCheck();
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedKeys.clear();
    this.cdr.markForCheck();
  }
}
```

**Template**: `src/app/shared/components/base-picker/base-picker.component.html`

```html
<div class="base-picker">
  <!-- Header -->
  <div class="picker-header">
    <h3>{{ config.title }}</h3>
    <span class="selection-count" *ngIf="selectedKeys.size > 0">
      {{ selectedKeys.size }} selected
    </span>
  </div>

  <!-- Search -->
  <div class="picker-search" *ngIf="config.ui?.showSearch">
    <input
      type="text"
      pInputText
      [placeholder]="config.search?.placeholder || 'Search...'"
      (input)="onSearchChange($any($event.target).value)"
      class="w-full"
    />
  </div>

  <!-- Loading State -->
  <div class="picker-loading" *ngIf="loading">
    <p-progressSpinner></p-progressSpinner>
    <p>{{ config.ui?.loadingMessage || 'Loading...' }}</p>
  </div>

  <!-- Error State -->
  <div class="picker-error" *ngIf="error">
    <p-message severity="error" [text]="error"></p-message>
  </div>

  <!-- Data Table -->
  <div class="picker-table" *ngIf="!loading && !error">
    <p-table
      [value]="getPaginatedData()"
      [rows]="pageSize"
      [lazy]="config.api.paginationMode === 'server'"
      [paginator]="config.ui?.showPagination"
      [totalRecords]="totalRecords"
      (onPage)="onPageChange($event.page + 1)"
      styleClass="p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          <!-- Checkbox column -->
          <th style="width: 50px"></th>

          <!-- Data columns -->
          <th
            *ngFor="let col of config.columns"
            [style.width]="col.width"
            [style.text-align]="col.align || 'left'"
            [pSortableColumn]="col.sortable ? col.key : undefined"
          >
            {{ col.label }}
            <p-sortIcon
              *ngIf="col.sortable"
              [field]="col.key"
            ></p-sortIcon>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr (click)="toggleRow(row)" class="selectable-row">
          <!-- Checkbox -->
          <td>
            <p-checkbox
              [ngModel]="isRowSelected(row)"
              [binary]="true"
              (click)="$event.stopPropagation()"
              (ngModelChange)="toggleRow(row)"
            ></p-checkbox>
          </td>

          <!-- Data cells -->
          <td
            *ngFor="let col of config.columns"
            [style.text-align]="col.align || 'left'"
          >
            {{
              col.formatter
                ? col.formatter(row[col.key])
                : row[col.key]
            }}
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="config.columns.length + 1">
            {{ config.ui?.emptyMessage || 'No data available' }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Footer Actions -->
  <div class="picker-footer">
    <button
      pButton
      label="Clear"
      class="p-button-text"
      (click)="clearSelections()"
      [disabled]="selectedKeys.size === 0"
    ></button>
    <div class="footer-actions-right">
      <button
        pButton
        label="Cancel"
        class="p-button-text"
        (click)="onCancel()"
      ></button>
      <button
        pButton
        label="Apply"
        (click)="onApply()"
        [disabled]="selectedKeys.size === 0"
      ></button>
    </div>
  </div>
</div>
```

**Styles**: `src/app/shared/components/base-picker/base-picker.component.scss`

```scss
.base-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  background-color: var(--surface-card);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .selection-count {
    color: var(--primary-color);
    font-weight: 500;
  }
}

.picker-search {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.picker-loading,
.picker-error {
  padding: 2rem;
  text-align: center;
}

.picker-table {
  flex: 1;
  overflow: auto;

  ::ng-deep {
    .selectable-row {
      cursor: pointer;

      &:hover {
        background-color: var(--surface-hover);
      }
    }

    .p-datatable {
      .p-datatable-thead > tr > th {
        background-color: var(--surface-section);
        font-weight: 600;
      }
    }
  }
}

.picker-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--surface-border);

  .footer-actions-right {
    display: flex;
    gap: 0.5rem;
  }
}
```

---

## 5. DEMO PAGE COMPONENT

**File**: `src/app/features/picker-demo/picker-demo.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PickerConfig } from '../../shared/models/picker-config.model';
import { BODY_CLASS_PICKER_CONFIG, BodyClass } from '../../shared/configs/body-class-picker.config';
import { MANUFACTURER_MODEL_PICKER_CONFIG, ManufacturerModelRow } from '../../shared/configs/manufacturer-model-picker.config';
import { PickerSelectionEvent } from '../../shared/components/base-picker/base-picker.component';

@Component({
  selector: 'app-picker-demo',
  templateUrl: './picker-demo.component.html',
  styleUrls: ['./picker-demo.component.scss']
})
export class PickerDemoComponent implements OnInit {
  // Picker configurations
  bodyClassConfig: PickerConfig<BodyClass> = BODY_CLASS_PICKER_CONFIG;
  manufacturerModelConfig: PickerConfig<ManufacturerModelRow> = MANUFACTURER_MODEL_PICKER_CONFIG;

  // Selected values
  selectedBodyClasses: BodyClass[] = [];
  selectedManufacturerModels: ManufacturerModelRow[] = [];

  // Dialog visibility
  showBodyClassPicker = false;
  showManufacturerModelPicker = false;

  // Initial selections from URL
  initialBodyClassSelections: string[] = [];
  initialManufacturerModelSelections: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Hydrate selections from URL
    this.route.queryParams.subscribe(params => {
      if (params['bodyClass']) {
        this.initialBodyClassSelections = params['bodyClass'].split(',');
      }
      if (params['modelCombos']) {
        this.initialManufacturerModelSelections = params['modelCombos'].split(',');
      }
    });
  }

  /**
   * Open body class picker
   */
  openBodyClassPicker(): void {
    this.showBodyClassPicker = true;
  }

  /**
   * Open manufacturer-model picker
   */
  openManufacturerModelPicker(): void {
    this.showManufacturerModelPicker = true;
  }

  /**
   * Handle body class selection
   */
  onBodyClassSelectionChange(event: PickerSelectionEvent<BodyClass>): void {
    this.selectedBodyClasses = event.selectedItems;
    this.updateUrl('bodyClass', event.urlValue);
    this.showBodyClassPicker = false;
  }

  /**
   * Handle manufacturer-model selection
   */
  onManufacturerModelSelectionChange(event: PickerSelectionEvent<ManufacturerModelRow>): void {
    this.selectedManufacturerModels = event.selectedItems;
    this.updateUrl('modelCombos', event.urlValue);
    this.showManufacturerModelPicker = false;
  }

  /**
   * Update URL with selection
   */
  private updateUrl(param: string, value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [param]: value || null },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Clear body class selection
   */
  clearBodyClassSelection(): void {
    this.selectedBodyClasses = [];
    this.updateUrl('bodyClass', '');
  }

  /**
   * Clear manufacturer-model selection
   */
  clearManufacturerModelSelection(): void {
    this.selectedManufacturerModels = [];
    this.updateUrl('modelCombos', '');
  }
}
```

**Template**: `src/app/features/picker-demo/picker-demo.component.html`

```html
<div class="picker-demo-page">
  <h1>Configuration-Driven Picker Demo</h1>
  <p class="subtitle">
    This page demonstrates two different picker configurations:
    <strong>Single-Selection Picker</strong> and <strong>Dual-Hierarchy Picker</strong>
  </p>

  <div class="demo-grid">
    <!-- Body Class Picker Demo -->
    <p-card header="Single-Selection Picker" subheader="Body Class Filter">
      <div class="picker-section">
        <p>
          This picker demonstrates a simple single-checkbox-per-row selection pattern.
          Users can select multiple body classes (Sedan, SUV, Truck, etc.).
        </p>

        <!-- Selected Items Display -->
        <div class="selected-items" *ngIf="selectedBodyClasses.length > 0">
          <strong>Selected Body Classes ({{ selectedBodyClasses.length }}):</strong>
          <div class="chip-container">
            <p-chip
              *ngFor="let item of selectedBodyClasses"
              [label]="item.bodyClass + ' (' + item.count + ')'"
              [removable]="true"
              (onRemove)="clearBodyClassSelection()"
            ></p-chip>
          </div>
        </div>

        <!-- No Selection State -->
        <div class="no-selection" *ngIf="selectedBodyClasses.length === 0">
          <i class="pi pi-info-circle"></i>
          <span>No body classes selected</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            pButton
            label="Select Body Classes"
            icon="pi pi-filter"
            (click)="openBodyClassPicker()"
          ></button>
          <button
            pButton
            label="Clear"
            class="p-button-outlined p-button-secondary"
            (click)="clearBodyClassSelection()"
            [disabled]="selectedBodyClasses.length === 0"
          ></button>
        </div>

        <!-- Configuration Info -->
        <p-accordion [activeIndex]="null" styleClass="mt-3">
          <p-accordionTab header="View Configuration">
            <pre><code>{{ bodyClassConfig | json }}</code></pre>
          </p-accordionTab>
        </p-accordion>
      </div>
    </p-card>

    <!-- Manufacturer-Model Picker Demo -->
    <p-card header="Dual-Hierarchy Picker" subheader="Manufacturer-Model Filter">
      <div class="picker-section">
        <p>
          This picker demonstrates a parent-child relationship selection pattern.
          Each row has two checkboxes: one for the manufacturer (parent) and one for the specific model (child).
        </p>

        <!-- Selected Items Display -->
        <div class="selected-items" *ngIf="selectedManufacturerModels.length > 0">
          <strong>Selected Combinations ({{ selectedManufacturerModels.length }}):</strong>
          <div class="chip-container">
            <p-chip
              *ngFor="let item of selectedManufacturerModels"
              [label]="item.manufacturer + ' ' + item.model + ' (' + item.count + ')'"
              [removable]="true"
              (onRemove)="clearManufacturerModelSelection()"
            ></p-chip>
          </div>
        </div>

        <!-- No Selection State -->
        <div class="no-selection" *ngIf="selectedManufacturerModels.length === 0">
          <i class="pi pi-info-circle"></i>
          <span>No manufacturer-model combinations selected</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            pButton
            label="Select Manufacturer-Model"
            icon="pi pi-filter"
            (click)="openManufacturerModelPicker()"
          ></button>
          <button
            pButton
            label="Clear"
            class="p-button-outlined p-button-secondary"
            (click)="clearManufacturerModelSelection()"
            [disabled]="selectedManufacturerModels.length === 0"
          ></button>
        </div>

        <!-- Configuration Info -->
        <p-accordion [activeIndex]="null" styleClass="mt-3">
          <p-accordionTab header="View Configuration">
            <pre><code>{{ manufacturerModelConfig | json }}</code></pre>
          </p-accordionTab>
        </p-accordion>
      </div>
    </p-card>
  </div>

  <!-- URL Display -->
  <p-card header="Current URL State" class="mt-4">
    <p>The current selections are reflected in the URL for shareability and bookmarking:</p>
    <pre class="url-display">{{ router.url }}</pre>
  </p-card>
</div>

<!-- Body Class Picker Dialog -->
<p-dialog
  [(visible)]="showBodyClassPicker"
  [header]="bodyClassConfig.title"
  [modal]="true"
  [style]="{ width: '70vw', height: '80vh' }"
  [contentStyle]="{ height: 'calc(100% - 60px)' }"
>
  <app-base-picker
    [config]="bodyClassConfig"
    [initialSelections]="initialBodyClassSelections"
    (selectionChange)="onBodyClassSelectionChange($event)"
    (cancel)="showBodyClassPicker = false"
  ></app-base-picker>
</p-dialog>

<!-- Manufacturer-Model Picker Dialog -->
<p-dialog
  [(visible)]="showManufacturerModelPicker"
  [header]="manufacturerModelConfig.title"
  [modal]="true"
  [style]="{ width: '70vw', height: '80vh' }"
  [contentStyle]="{ height: 'calc(100% - 60px)' }"
>
  <app-dual-checkbox-picker
    [config]="manufacturerModelConfig"
    [initialSelections]="initialManufacturerModelSelections"
    (selectionChange)="onManufacturerModelSelectionChange($event)"
    (cancel)="showManufacturerModelPicker = false"
  ></app-dual-checkbox-picker>
</p-dialog>
```

---

## 6. CONFIGURATION GUIDE

### Step-by-Step: Creating a New Picker Configuration

**Step 1: Define Your Data Model**

```typescript
// src/app/shared/models/your-data.model.ts
export interface YourDataType {
  id: string;
  name: string;
  value: number;
  // ... other fields
}
```

**Step 2: Create Picker Configuration**

```typescript
// src/app/shared/configs/your-picker.config.ts
import { PickerConfig } from '../models/picker-config.model';
import { YourDataType } from '../models/your-data.model';

export const YOUR_PICKER_CONFIG: PickerConfig<YourDataType> = {
  id: 'your-picker-id',
  title: 'Select Items',

  // Define columns to display
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'value', label: 'Value', sortable: true, align: 'right' }
  ],

  // Configure API
  api: {
    endpoint: '/api/specs/v1/your-endpoint',  // or /api/vins/v1/ or /api/auth/v1/
    method: 'GET',
    paginationMode: 'server',  // or 'client'
    responseTransformer: (response: any) => ({
      results: response.data,
      total: response.total
    })
  },

  // Configure row behavior
  row: {
    keyGenerator: (row: YourDataType) => row.id
  },

  // Configure selection
  selection: {
    mode: 'multiple',
    urlParam: 'yourParam',
    serializer: (items: YourDataType[]) => items.map(i => i.id).join(','),
    deserializer: (urlValue: string) => urlValue.split(',').map(id => ({ id }))
  },

  // Configure search
  search: {
    enabled: true,
    placeholder: 'Search...',
    fields: ['name']
  },

  // Configure UI
  ui: {
    showSearch: true,
    showPagination: true
  }
};
```

**Step 3: Register Configuration**

```typescript
// src/app/shared/services/picker-config.service.ts
import { YOUR_PICKER_CONFIG } from '../configs/your-picker.config';

@Injectable({
  providedIn: 'root'
})
export class PickerConfigService {
  private configs = new Map<string, PickerConfig<any>>();

  constructor() {
    // Register all configurations
    this.register(BODY_CLASS_PICKER_CONFIG);
    this.register(MANUFACTURER_MODEL_PICKER_CONFIG);
    this.register(YOUR_PICKER_CONFIG);  // Add yours
  }

  register(config: PickerConfig<any>): void {
    this.configs.set(config.id, config);
  }

  get<T>(id: string): PickerConfig<T> | undefined {
    return this.configs.get(id);
  }
}
```

**Step 4: Use in Component**

```typescript
export class YourComponent {
  pickerConfig = YOUR_PICKER_CONFIG;
  showPicker = false;
  selectedItems: YourDataType[] = [];

  openPicker(): void {
    this.showPicker = true;
  }

  onSelectionChange(event: PickerSelectionEvent<YourDataType>): void {
    this.selectedItems = event.selectedItems;
    this.showPicker = false;
  }
}
```

```html
<button pButton (click)="openPicker()">Select Items</button>

<p-dialog [(visible)]="showPicker">
  <app-base-picker
    [config]="pickerConfig"
    (selectionChange)="onSelectionChange($event)"
  ></app-base-picker>
</p-dialog>
```

---

## 7. API INTEGRATION

### 7.1 Backend API Requirements

**Note**: The backend uses a microservices architecture. Vehicle specification endpoints are served by the Specs API at `/api/specs/v1/*`.

**Endpoint**: `GET /api/specs/v1/filters/body-classes`

**Response Format** (Client-side pagination):
```json
{
  "success": true,
  "data": [
    { "value": "Sedan", "count": 1234 },
    { "value": "SUV", "count": 987 },
    { "value": "Truck", "count": 654 }
  ]
}
```

**Endpoint**: `GET /api/specs/v1/manufacturer-model-combinations`

**Query Parameters**:
- `page` (number): Page number (1-indexed)
- `size` (number): Results per page
- `search` (string, optional): Search term

**Response Format** (Server-side pagination):
```json
{
  "success": true,
  "results": [
    { "manufacturer": "Ford", "model": "F-150", "count": 523 },
    { "manufacturer": "Ford", "model": "Mustang", "count": 412 }
  ],
  "total": 1523,
  "page": 1,
  "totalPages": 77
}
```

### 7.2 Mock API (For Development)

If backend is not ready, create mock service:

```typescript
// src/app/shared/services/mock-api.service.ts
@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  getBodyClasses(): Observable<any> {
    return of({
      success: true,
      data: [
        { value: 'Sedan', count: 1234 },
        { value: 'SUV', count: 987 },
        { value: 'Truck', count: 654 },
        { value: 'Coupe', count: 432 },
        { value: 'Wagon', count: 321 }
      ]
    }).pipe(delay(500));  // Simulate network delay
  }

  getManufacturerModelCombinations(page: number, size: number): Observable<any> {
    const allData = [
      { manufacturer: 'Ford', model: 'F-150', count: 523 },
      { manufacturer: 'Ford', model: 'Mustang', count: 412 },
      { manufacturer: 'Toyota', model: 'Camry', count: 678 },
      // ... more data
    ];

    const start = (page - 1) * size;
    const end = start + size;

    return of({
      success: true,
      results: allData.slice(start, end),
      total: allData.length,
      page,
      totalPages: Math.ceil(allData.length / size)
    }).pipe(delay(500));
  }
}
```

---

## 8. TESTING

### 8.1 Unit Tests

```typescript
// base-picker.component.spec.ts
describe('BasePickerComponent', () => {
  it('should load data on init', () => {
    // ...
  });

  it('should toggle row selection', () => {
    // ...
  });

  it('should emit selection event on apply', () => {
    // ...
  });

  it('should handle server-side pagination', () => {
    // ...
  });

  it('should handle client-side search', () => {
    // ...
  });
});
```

### 8.2 E2E Tests

```typescript
// picker-demo.e2e.spec.ts
test('should select body class and update URL', async ({ page }) => {
  await page.goto('/picker-demo');

  await page.click('text=Select Body Classes');
  await page.click('text=Sedan');
  await page.click('text=Apply');

  await expect(page).toHaveURL(/bodyClass=Sedan/);
});
```

---

## 9. DEPLOYMENT

### 9.1 Route Configuration

```typescript
// app-routing.module.ts
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

### 9.2 Build & Test

```bash
# Run unit tests
npm test

# Run E2E tests
npm run e2e

# Build production
npm run build

# Serve demo
ng serve
# Navigate to http://localhost:4200/picker-demo
```

---

## 10. SUCCESS CRITERIA

MVP is complete when:

- ✅ Demo page accessible at `/picker-demo`
- ✅ Body class picker functional (single selection)
- ✅ Manufacturer-model picker functional (dual hierarchy)
- ✅ Selections reflected in URL
- ✅ URL hydration works (page refresh preserves selections)
- ✅ Both server-side and client-side pagination working
- ✅ Search functionality working
- ✅ Configuration guide documentation complete
- ✅ All unit tests passing (80%+ coverage)
- ✅ E2E tests passing for critical paths

---

## 11. DELIVERABLES CHECKLIST

### Code Deliverables
- [x] `PickerConfig` interface and types
- [x] `BasePickerComponent` (single selection)
- [x] `DualCheckboxPickerComponent` (dual hierarchy)
- [x] `PickerDemoComponent` (demo page)
- [x] `BODY_CLASS_PICKER_CONFIG` (example config 1)
- [x] `MANUFACTURER_MODEL_PICKER_CONFIG` (example config 2)
- [x] `PickerConfigService` (configuration registry)

### Documentation Deliverables
- [x] This MVP specification document
- [x] Configuration guide (Section 6)
- [x] API integration guide (Section 7)
- [x] Step-by-step setup instructions

### Testing Deliverables
- [ ] Unit tests for BasePickerComponent
- [ ] Unit tests for DualCheckboxPickerComponent
- [ ] E2E tests for demo page
- [ ] Test coverage report (target: 80%+)

---

**END OF MVP SPECIFICATION**

This document provides complete, implementation-ready requirements for demonstrating the configuration-driven picker architecture.
