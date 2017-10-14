import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MdcSelectModule, MdcSelect, MdcSelectItem } from '../../../src/lib/public_api';

describe('MdcSelectModule', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdcSelectModule],
      declarations: [
        SimpleTest,
      ]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let testDebugElement: DebugElement;
    let testNativeElement: HTMLElement;
    let testInstance: MdcSelect;
    let testComponent: SimpleTest;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTest);
      fixture.detectChanges();

      testDebugElement = fixture.debugElement.query(By.directive(MdcSelect));
      testNativeElement = testDebugElement.nativeElement;
      testInstance = testDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('#should have mdc-select by default', () => {
      expect(testDebugElement.nativeElement.classList).toContain('mdc-select');
    });

    // it('#should set value to 2', () => {
    //   testInstance.setSelectedIndex(2);
    //   fixture.detectChanges();
    //   expect(testInstance.getValue()).toBe('2');
    // });
  });
});

/** Simple component for testing. */
@Component({
  template:
  `
  <mdc-select [placeholder]="myPlaceholder">
    <mdc-select-item>Hamburger</mdc-select-item>
    <mdc-select-item>Pizza</mdc-select-item>
    <mdc-select-item>Tacos</mdc-select-item>
  </mdc-select>
  `,
})
class SimpleTest {
  myPlaceholder: string = 'Favorite food';
  isDisabled: boolean = true;

  handleChange(event: { index: number, value: string }) {
    // this.selectedIndex = event.index;
  }
}
