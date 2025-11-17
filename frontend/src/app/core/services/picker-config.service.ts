import { Injectable } from '@angular/core';
import { PickerConfig } from '../../shared/models/picker-config.model';

/**
 * Picker Configuration Registry Service
 *
 * Per specs/06-filter-picker-components.md:
 * - Centralized registry for all picker configurations
 * - Pickers load configuration by ID instead of receiving hardcoded data
 * - Enables configuration-driven architecture
 *
 * Usage:
 * ```typescript
 * // Register a configuration (typically in app initialization)
 * pickerConfigService.registerConfig(BODY_CLASS_PICKER_CONFIG);
 *
 * // Retrieve configuration in component
 * const config = pickerConfigService.getConfig('body-class-picker');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PickerConfigService {
  private configs = new Map<string, PickerConfig<any>>();

  /**
   * Register a picker configuration
   * Should be called during application initialization
   */
  registerConfig<T>(config: PickerConfig<T>): void {
    if (this.configs.has(config.id)) {
      console.warn(`Picker configuration with id '${config.id}' is already registered. Overwriting.`);
    }
    this.configs.set(config.id, config);
  }

  /**
   * Register multiple picker configurations at once
   */
  registerConfigs(configs: PickerConfig<any>[]): void {
    configs.forEach(config => this.registerConfig(config));
  }

  /**
   * Get a picker configuration by ID
   * Returns undefined if configuration is not found
   */
  getConfig<T>(configId: string): PickerConfig<T> | undefined {
    const config = this.configs.get(configId);
    if (!config) {
      console.error(`Picker configuration with id '${configId}' not found. Make sure it's registered.`);
    }
    return config;
  }

  /**
   * Check if a configuration exists
   */
  hasConfig(configId: string): boolean {
    return this.configs.has(configId);
  }

  /**
   * Get all registered configuration IDs
   */
  getRegisteredIds(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Unregister a configuration (useful for testing)
   */
  unregisterConfig(configId: string): void {
    this.configs.delete(configId);
  }

  /**
   * Clear all configurations (useful for testing)
   */
  clearAll(): void {
    this.configs.clear();
  }
}
