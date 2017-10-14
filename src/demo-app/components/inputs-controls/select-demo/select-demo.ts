import { Component } from '@angular/core';

@Component({
  selector: 'select-demo',
  templateUrl: './select-demo.html'
})
export class SelectDemo {
  isDisabled: boolean = false;
  selectedValue: string;

  foods = [
    { value: 'steak-0', description: 'Steak' },
    { value: 'pizza-1', description: 'Pizza' },
    { value: 'tacos-2', description: 'Tacos' }
  ];
}
