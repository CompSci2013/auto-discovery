import { PickerConfig } from '../models/picker-config.model';

/**
 * Body Class data type
 */
export interface BodyClass {
  id: string;
  name: string;
}

/**
 * Static body class data
 * In a real application, this would come from an API
 */
const BODY_CLASS_DATA: BodyClass[] = [
  { id: 'sedan', name: 'Sedan' },
  { id: 'suv', name: 'SUV' },
  { id: 'truck', name: 'Truck' },
  { id: 'van', name: 'Van' },
  { id: 'coupe', name: 'Coupe' },
  { id: 'hatchback', name: 'Hatchback' },
  { id: 'wagon', name: 'Wagon' },
  { id: 'convertible', name: 'Convertible' }
];

/**
 * Body Class Picker Configuration
 *
 * Per specs/06-filter-picker-components.md:
 * - Configuration-driven picker
 * - URL-First state management via selection.urlParam
 * - Serializer/deserializer for URL persistence
 *
 * URL Example: /demo?bodyClasses=sedan,suv,truck
 */
export const BODY_CLASS_PICKER_CONFIG: PickerConfig<BodyClass> = {
  id: 'body-class-picker',
  displayName: 'Vehicle Body Class Picker',

  // Column definitions
  columns: [
    { key: 'name', label: 'Body Class', sortable: true },
    { key: 'id', label: 'ID', sortable: true }
  ],

  // API configuration (using static data for MVP)
  api: {
    method: 'getBodyClasses',
    responseTransformer: (response) => ({
      results: BODY_CLASS_DATA,
      total: BODY_CLASS_DATA.length
    })
  },

  // Row identification
  row: {
    keyGenerator: (row: BodyClass) => row.id,
    keyParser: (key: string) => ({ id: key, name: key })
  },

  // Selection state with URL persistence
  selection: {
    urlParam: 'bodyClasses',
    // Serialize: Convert array of BodyClass to comma-separated IDs
    serializer: (items: BodyClass[]) => items.map(item => item.id).join(','),
    // Deserialize: Convert comma-separated IDs back to BodyClass array
    deserializer: (urlValue: string) => {
      if (!urlValue || urlValue.trim() === '') {
        return [];
      }
      return urlValue.split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)
        .map(id => {
          // Find the full object from our data
          const found = BODY_CLASS_DATA.find(item => item.id === id);
          return found || { id, name: id };
        });
    }
  },

  // Pagination configuration
  pagination: {
    mode: 'client',
    defaultPageSize: 20
  }
};

/**
 * Helper function to get body class data
 * Used by the picker component to load data
 */
export function getBodyClassData(): BodyClass[] {
  return [...BODY_CLASS_DATA];
}
