import { Component, ViewChild } from '@angular/core';

// import { MdcFab } from '@angular-mdc/web';
import { MdcFab } from '../../../../lib/public_api';

@Component({
  selector: 'fab-demo',
  templateUrl: './fab-demo.html'
})
export class FabDemo {
  @ViewChild('fab') fab: MdcFab;
  isMini: boolean = false;
  isExited: boolean = false;
  isRippleDisabled: boolean = false;

  handleFabExitedClick(): void {
    this.isExited = !this.isExited;
    this.fab.toggleExited();
  }
}
