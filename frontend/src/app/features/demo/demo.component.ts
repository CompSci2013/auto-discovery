import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PickerConfigService } from '../../core/services/picker-config.service';
import { BODY_CLASS_PICKER_CONFIG } from '../../shared/configs/body-class-picker.config';

/**
 * Demo Component
 *
 * Demonstrates configuration-driven picker with URL-First state management
 * Per specs/04-state-management-specification.md and specs/06-filter-picker-components.md
 */
@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  // Configuration ID for the picker (configuration-driven approach)
  bodyClassPickerConfigId = 'body-class-picker';

  constructor(
    private authService: AuthService,
    private router: Router,
    private pickerConfigService: PickerConfigService
  ) {
    // Register picker configurations
    this.registerPickerConfigs();
  }

  ngOnInit(): void {
  }

  /**
   * Register picker configurations with the PickerConfigService
   * This makes them available to picker components by ID
   */
  private registerPickerConfigs(): void {
    this.pickerConfigService.registerConfig(BODY_CLASS_PICKER_CONFIG);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
