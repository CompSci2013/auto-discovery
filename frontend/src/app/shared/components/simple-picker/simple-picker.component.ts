import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PickerConfig } from '../../models/picker-config.model';
import { PickerConfigService } from '../../../core/services/picker-config.service';
import { UrlStateService } from '../../../core/services/url-state.service';

/**
 * Simple Picker Component - Configuration-Driven with URL-First State
 *
 * Per specs/06-filter-picker-components.md:
 * - Loads configuration by ID from PickerConfigService
 * - Selection state persisted in URL query parameters
 * - Uses Set<string> for O(1) selection lookups
 * - Hydrates selections from URL on initialization
 *
 * Usage:
 * ```html
 * <app-simple-picker [configId]="'body-class-picker'"></app-simple-picker>
 * ```
 */
@Component({
  selector: 'app-simple-picker',
  templateUrl: './simple-picker.component.html',
  styleUrls: ['./simple-picker.component.scss']
})
export class SimplePickerComponent<T = any> implements OnInit, OnDestroy {
  @Input() configId?: string;
  @Input() config?: PickerConfig<T>;

  // Data and state
  data: T[] = [];
  selectedRows = new Set<string>();  // O(1) lookup performance
  private destroy$ = new Subject<void>();

  constructor(
    private pickerConfigService: PickerConfigService,
    private urlStateService: UrlStateService
  ) {}

  ngOnInit(): void {
    // Load configuration
    if (!this.config && this.configId) {
      this.config = this.pickerConfigService.getConfig(this.configId);
    }

    if (!this.config) {
      console.error('SimplePickerComponent: No config provided or found');
      return;
    }

    // Load data
    this.loadData();

    // Watch URL for selection changes
    this.watchUrlSelections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load data using the configuration's API settings
   */
  private loadData(): void {
    if (!this.config) return;

    // For MVP, we're using static data via the API's responseTransformer
    // In production, this would make an HTTP call
    const response = this.config.api.responseTransformer(null);
    this.data = response.results;
  }

  /**
   * Watch URL parameters for selection changes
   * Implements URL-First state management
   */
  private watchUrlSelections(): void {
    if (!this.config) return;

    const urlParam = this.config.selection.urlParam;

    this.urlStateService.getParam$(urlParam)
      .pipe(takeUntil(this.destroy$))
      .subscribe(urlValue => {
        this.hydrateSelectionsFromUrl(urlValue);
      });
  }

  /**
   * Hydrate selections from URL parameter value
   */
  private hydrateSelectionsFromUrl(urlValue: string | null): void {
    if (!this.config) return;

    this.selectedRows.clear();

    if (urlValue) {
      // Deserialize URL value to items
      const items = this.config.selection.deserializer(urlValue);

      // Convert items to keys and add to Set
      items.forEach(item => {
        const key = this.config!.row.keyGenerator(item);
        this.selectedRows.add(key);
      });
    }
  }

  /**
   * Toggle selection for a row
   */
  onRowToggle(row: T): void {
    if (!this.config) return;

    const key = this.config.row.keyGenerator(row);

    if (this.selectedRows.has(key)) {
      this.selectedRows.delete(key);
    } else {
      this.selectedRows.add(key);
    }

    this.updateUrlFromSelections();
  }

  /**
   * Update URL with current selections
   * This is the key to URL-First architecture
   */
  private updateUrlFromSelections(): void {
    if (!this.config) return;

    // Get selected items from data
    const selectedItems = this.data.filter(row => {
      const key = this.config!.row.keyGenerator(row);
      return this.selectedRows.has(key);
    });

    // Serialize to URL value
    const urlValue = selectedItems.length > 0
      ? this.config.selection.serializer(selectedItems)
      : null;

    // Update URL
    const urlParam = this.config.selection.urlParam;
    this.urlStateService.updateParam(urlParam, urlValue);
  }

  /**
   * Check if a row is selected
   */
  isRowSelected(row: T): boolean {
    if (!this.config) return false;
    const key = this.config.row.keyGenerator(row);
    return this.selectedRows.has(key);
  }

  /**
   * Get count of selected items
   */
  get selectedCount(): number {
    return this.selectedRows.size;
  }

  /**
   * Get cell value for a row and column
   * Helper method for template to avoid TypeScript indexing errors
   */
  getCellValue(row: T, columnKey: string): any {
    return (row as any)[columnKey];
  }
}
