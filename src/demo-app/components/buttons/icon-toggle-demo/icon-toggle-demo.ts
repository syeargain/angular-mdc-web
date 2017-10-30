import { Component } from '@angular/core';

@Component({
  selector: 'icon-toggle-demo',
  templateUrl: './icon-toggle-demo.html'
})
export class IconToggleDemo {
  isOn: boolean = false;
  isDisabled: boolean = false;
  isPrimary: boolean = false;
  isAccent: boolean = false;
  isDarkTheme: boolean = false;
}
