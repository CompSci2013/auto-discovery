import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PickerConfig } from '../../shared/models/picker-config.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  bodyClassPickerConfig: PickerConfig = {
    id: 'body-class-picker',
    title: 'Vehicle Body Class Picker',
    options: [
      { id: 'sedan', name: 'Sedan', selected: false },
      { id: 'suv', name: 'SUV', selected: true },
      { id: 'truck', name: 'Truck', selected: false },
      { id: 'van', name: 'Van', selected: false },
      { id: 'coupe', name: 'Coupe', selected: false },
      { id: 'hatchback', name: 'Hatchback', selected: false },
      { id: 'wagon', name: 'Wagon', selected: false },
      { id: 'convertible', name: 'Convertible', selected: false }
    ],
    multiSelect: true
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
