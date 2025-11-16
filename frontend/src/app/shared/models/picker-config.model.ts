/**
 * Configuration for picker components
 * Per spec: specs/DEVELOPMENT-PLAN.md Phase 2
 */

export interface PickerOption {
  id: string;
  name: string;
  selected: boolean;
  children?: PickerOption[];
}

export interface PickerColumn {
  field: string;
  header: string;
  width?: string;
}

export interface PickerConfig {
  id: string;
  title: string;
  options: PickerOption[];
  columns?: PickerColumn[];
  multiSelect?: boolean;
}
