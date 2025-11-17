import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

/**
 * URL State Management Service
 *
 * Per specs/04-state-management-specification.md:
 * - URL is the single source of truth for application state
 * - Provides observable streams for URL parameters
 * - Updates URL without navigation
 *
 * Usage:
 * ```typescript
 * // Watch a specific parameter
 * urlState.getParam$('bodyClasses').subscribe(value => {...});
 *
 * // Update parameters
 * urlState.updateParams({ bodyClasses: 'sedan,suv' });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UrlStateService {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Get observable for all query parameters
   */
  getQueryParams$(): Observable<Params> {
    return this.route.queryParams.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  /**
   * Get observable for a specific query parameter
   */
  getParam$(paramName: string): Observable<string | null> {
    return this.route.queryParams.pipe(
      map(params => params[paramName] || null),
      distinctUntilChanged()
    );
  }

  /**
   * Get current value of a query parameter (synchronous)
   */
  getParam(paramName: string): string | null {
    return this.route.snapshot.queryParams[paramName] || null;
  }

  /**
   * Get all current query parameters (synchronous)
   */
  getCurrentParams(): Params {
    return { ...this.route.snapshot.queryParams };
  }

  /**
   * Update query parameters without navigation
   * Merges with existing parameters by default
   *
   * @param params - Parameters to update
   * @param merge - If true, merge with existing params; if false, replace all params
   */
  updateParams(params: Params, merge: boolean = true): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: merge ? 'merge' : '',
      replaceUrl: true  // Don't add to browser history
    });
  }

  /**
   * Update a single query parameter
   */
  updateParam(paramName: string, value: string | null): void {
    const params: Params = value !== null && value !== ''
      ? { [paramName]: value }
      : { [paramName]: null };  // null removes the parameter

    this.updateParams(params, true);
  }

  /**
   * Remove specific query parameters
   */
  removeParams(paramNames: string[]): void {
    const params: Params = {};
    paramNames.forEach(name => {
      params[name] = null;  // Setting to null removes the parameter
    });
    this.updateParams(params, true);
  }

  /**
   * Clear all query parameters
   */
  clearAllParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  /**
   * Check if a parameter exists in the URL
   */
  hasParam(paramName: string): boolean {
    return paramName in this.route.snapshot.queryParams;
  }
}
