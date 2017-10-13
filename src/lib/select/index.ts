import { NgModule } from '@angular/core';

import {
  MdcSelect,
  MdcSelectContainer,
  MdcSelectedItem,
  MdcSelectItem,
} from './select.component';

export const SELECT_COMPONENTS = [
  MdcSelect,
  MdcSelectContainer,
  MdcSelectedItem,
  MdcSelectItem,
];

@NgModule({
  exports: [SELECT_COMPONENTS],
  declarations: [SELECT_COMPONENTS],
})
export class MdcSelectModule { }

export * from './select.component';
