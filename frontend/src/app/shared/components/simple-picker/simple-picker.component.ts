import { Component, Input, OnInit } from '@angular/core';
import { PickerConfig, PickerOption } from '../../models/picker-config.model';

@Component({
  selector: 'app-simple-picker',
  templateUrl: './simple-picker.component.html',
  styleUrls: ['./simple-picker.component.scss']
})
export class SimplePickerComponent implements OnInit {
  @Input() config!: PickerConfig;

  constructor() { }

  ngOnInit(): void {
    if (!this.config) {
      console.warn('SimplePickerComponent: No config provided');
    }
  }

  onOptionToggle(option: PickerOption): void {
    option.selected = !option.selected;
  }

  get selectedCount(): number {
    return this.config?.options.filter(opt => opt.selected).length || 0;
  }
}
