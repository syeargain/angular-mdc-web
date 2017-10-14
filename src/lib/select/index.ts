import { NgModule } from '@angular/core';

import {
  MdcSelect,
  MdcSelectedItem,
  MdcSelectItem,
  MdcSelectItems,
  MdcSelectMenu,
} from './select.component';

export const SELECT_COMPONENTS = [
  MdcSelect,
  MdcSelectedItem,
  MdcSelectItem,
  MdcSelectItems,
  MdcSelectMenu,
];

@NgModule({
  exports: [SELECT_COMPONENTS],
  declarations: [SELECT_COMPONENTS],
})
export class MdcSelectModule { }

export * from './select.component';
