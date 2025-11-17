/**
 * Configuration for picker components
 * Per specs:
 * - specs/05-data-visualization-components.md
 * - specs/06-filter-picker-components.md
 *
 * These interfaces define a configuration-driven picker architecture
 * with URL-First state management.
 */

/**
 * Column configuration for picker tables
 */
export interface PickerColumnConfig<T = any> {
  key: string;               // Property key in data object
  label: string;             // Display label
  sortable?: boolean;        // Enable sorting
  filterable?: boolean;      // Enable filtering
  width?: string;            // CSS width
  align?: 'left' | 'right' | 'center';
}

/**
 * Row identification configuration
 * Required for selection state management
 */
export interface PickerRowConfig<T = any> {
  keyGenerator: (row: T) => string;           // Generate unique key from row data
  keyParser: (key: string) => Partial<T>;     // Parse key back to row data
}

/**
 * Selection state configuration with URL persistence
 * This enables URL-First state management
 */
export interface PickerSelectionConfig<T = any> {
  urlParam: string;                               // URL parameter name (e.g., 'selectedVins')
  serializer: (items: T[]) => string;             // Convert selections to URL string
  deserializer: (urlValue: string) => T[];        // Parse URL string to selections
  keyGenerator?: (item: T) => string;             // Optional: generate key from item
  keyParser?: (key: string) => Partial<T>;        // Optional: parse key to item
}

/**
 * API configuration for data loading
 */
export interface PickerApiConfig<T = any> {
  method: string;                                 // Method name on data service
  paramMapper?: (params: any) => any;             // Transform params before API call
  responseTransformer: (response: any) => {       // Transform API response
    results: T[];
    total: number;
    page?: number;
    size?: number;
    totalPages?: number;
  };
}

/**
 * Pagination configuration
 */
export interface PickerPaginationConfig {
  mode: 'client' | 'server';                      // Client-side or server-side pagination
  defaultPageSize: number;                        // Default page size
  pageSizeOptions?: number[];                     // Available page size options
}

/**
 * Caching configuration
 */
export interface PickerCachingConfig {
  enabled: boolean;
  ttl?: number;                                   // Time to live in milliseconds
}

/**
 * Main picker configuration interface
 * This is the complete configuration object that defines picker behavior
 */
export interface PickerConfig<T = any> {
  id: string;                                     // Unique identifier for this picker
  displayName: string;                            // Display title
  columns: PickerColumnConfig<T>[];               // Column definitions
  api: PickerApiConfig<T>;                        // API configuration
  row: PickerRowConfig<T>;                        // Row identification
  selection: PickerSelectionConfig<T>;            // Selection state with URL persistence
  pagination: PickerPaginationConfig;             // Pagination settings
  filtering?: any;                                // Optional filtering config
  sorting?: any;                                  // Optional sorting config
  caching?: PickerCachingConfig;                  // Optional caching config
}

/**
 * Legacy interfaces for backward compatibility
 * @deprecated Use PickerConfig<T> instead
 */
export interface PickerOption {
  id: string;
  name: string;
  selected?: boolean;
  children?: PickerOption[];
}

export interface PickerColumn {
  field: string;
  header: string;
  width?: string;
}
