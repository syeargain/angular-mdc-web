import {
  AfterViewInit,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  Provider,
  QueryList,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { toBoolean, isBrowser } from '../common';
import { EventRegistry } from '../common/event-registry';

import { MDCSimpleMenu } from '@material/menu/simple';

import { MDCSelectAdapter } from './adapter';
import { MDCSelectFoundation } from '@material/select';

export const MDC_SELECT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdcSelect),
  multi: true
};

let nextUniqueId = 0;

@Directive({
  selector: 'mdc-selected-item'
})
export class MdcSelectedItem {
  @HostBinding('class.mdc-select__selected-text') isHostClass = true;

  constructor(public elementRef: ElementRef) { }
}

@Directive({
  selector: 'mdc-select-item'
})
export class MdcSelectItem {
  private disabled_: boolean = false;

  @Input() value: string;
  @Input() description: string;
  @Input()
  get disabled(): boolean {
    return this.disabled_;
  }
  set disabled(value: boolean) {
    this.disabled_ = value;
    if (value) {
      this.renderer_.setAttribute(this.elementRef.nativeElement, 'aria-disabled', 'true');
      this.tabindex = -1;
    } else {
      this.renderer_.removeAttribute(this.elementRef.nativeElement, 'aria-disabled');
      this.tabindex = 0;
    }
  }
  @HostBinding('class.mdc-list-item') isHostClass = true;
  @HostBinding('attr.role') role: string = 'option';
  @HostBinding('tabindex') tabindex: number = 0;

  constructor(
    private renderer_: Renderer2,
    public elementRef: ElementRef) { }
}

@Directive({
  selector: 'mdc-select-menu',
})
export class MdcSelectMenu {
  @HostBinding('class.mdc-simple-menu') isHostClass = true;
  @HostBinding('class.mdc-select__menu') isSelectClass = true;

  constructor(public elementRef: ElementRef) { }
}

@Directive({
  selector: 'mdc-select-items',
})
export class MdcSelectItems {
  @HostBinding('class.mdc-list') isHostClass = true;
  @HostBinding('class.mdc-simple-menu__items') isSelectClass = true;

  constructor(public elementRef: ElementRef) { }
}

@Component({
  selector: 'mdc-select',
  host: {
    '[id]': 'id',
  },
  template:
  `
  <mdc-selected-item>{{placeholder}}</mdc-selected-item>
  <mdc-select-menu>
    <mdc-select-items>
      <ng-content></ng-content>
    </mdc-select-items>
  </mdc-select-menu>
  `,
  providers: [
    MDC_SELECT_CONTROL_VALUE_ACCESSOR,
    EventRegistry,
  ],
})
export class MdcSelect implements AfterViewInit, ControlValueAccessor, OnDestroy {
  private open_: boolean = false;
  private placeholder_: string = '';
  private value_: string = '';
  private uniqueId_: string = `mdc-select-${++nextUniqueId}`;
  private menuFactory_: any;
  private controlValueAccessorChangeFn_: (value: any) => void = () => { };
  onTouched: () => any = () => { };

  @Input() id: string = this.uniqueId_;
  get inputId(): string { return `${this.id || this.uniqueId_}-input`; }
  @Input() name: string | null = null;
  @Input()
  get value(): string { return this.foundation_.getValue(); }
  set value(v: string) {
    this.value_ = v;
  }
  @Input()
  get placeholder(): string { return this.placeholder_; }
  set placeholder(value: string) {
    this.placeholder_ = value;
  }
  @Input()
  get disabled(): boolean { return this.isDisabled(); }
  set disabled(value: boolean) {
    this.setDisabled(value);
  }
  @Output('change') change_ = new EventEmitter<{ index: number, value: any }>();
  @HostBinding('class.mdc-select') isHostClass = true;
  @HostBinding('attr.role') role: string = 'listbox';
  @HostBinding('tabindex') tabIndex: number = 0;
  @ViewChild(MdcSelectedItem) selectedItem: MdcSelectedItem;
  @ContentChildren(MdcSelectItem) options: QueryList<MdcSelectItem>;
  @ViewChild(MdcSelectMenu) selectMenu: MdcSelectMenu;
  @ViewChild(MdcSelectItems) selectItems: MdcSelectItems;

  private mdcAdapter_: MDCSelectAdapter = {
    addClass: (className: string) => {
      this.renderer_.addClass(this.elementRef.nativeElement, className);
    },
    removeClass: (className: string) => {
      this.renderer_.removeClass(this.elementRef.nativeElement, className);
    },
    setAttr: (attr: string, value: string) => {
      this.renderer_.setAttribute(this.elementRef.nativeElement, attr, value);
    },
    rmAttr: (attr: string) => {
      this.renderer_.removeAttribute(this.elementRef.nativeElement, attr);
    },
    computeBoundingRect: () => {
      return this.elementRef.nativeElement.getBoundingClientRect();
    },
    registerInteractionHandler: (type: string, handler: EventListener) => {
      this.registry_.listen_(this.renderer_, type, handler, this.elementRef);
    },
    deregisterInteractionHandler: (type: string, handler: EventListener) => {
      this.registry_.unlisten_(type, handler);
    },
    focus: () => this.elementRef.nativeElement.focus(),
    makeTabbable: () => this.elementRef.nativeElement.tabIndex = 0,
    makeUntabbable: () => this.elementRef.nativeElement.tabIndex = -1,
    getComputedStyleValue: (propertyName: string) => {
      return isBrowser() ? window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue(propertyName) : '';
    },
    setStyle: (propertyName: string, value: string) => {
      this.renderer_.setProperty(this.elementRef.nativeElement, propertyName, value);
    },
    create2dRenderingContext: () => {
      return this.renderer_.createElement('canvas').getContext('2d');
    },
    setMenuElStyle: (propertyName: string, value: string) => {
      this.renderer_.setProperty(this.selectMenu.elementRef.nativeElement, propertyName, value);
    },
    setMenuElAttr: (attr: string, value: string) => {
      this.renderer_.setAttribute(this.selectMenu.elementRef.nativeElement, attr, value);
    },
    rmMenuElAttr: (attr: string) => {
      this.renderer_.removeAttribute(this.selectMenu.elementRef.nativeElement, attr);
    },
    getMenuElOffsetHeight: () => {
      return this.selectMenu.elementRef.nativeElement.offsetHeight;
    },
    openMenu: (focusIndex: number) => {
      this.menuFactory_.show({ focusIndex });
    },
    isMenuOpen: () => this.menuFactory_.open,
    setSelectedTextContent: (textContent: string) => {
      // this.selectedItem.elementRef.nativeElement.textContent = textContent;
      this.placeholder_ = textContent;
    },
    getNumberOfOptions: () => {
      return this.options ? this.options.length : 0;
    },
    getTextForOptionAtIndex: (index: number) => {
      return this.getItemByIndex(index).elementRef.nativeElement.textContent;
    },
    getValueForOptionAtIndex: (index: number) => {
      return this.getItemByIndex(index).value || this.getItemByIndex(index).description;
      // return this.getItemByIndex(index).nativeElement.id || this.getItemByIndex(index).nativeElement.textContent;
    },
    setAttrForOptionAtIndex: (index: number, attr: string, value: string) => {
      this.renderer_.setAttribute(this.getItemByIndex(index).elementRef.nativeElement, attr, value);
    },
    rmAttrForOptionAtIndex: (index: number, attr: string) => {
      this.renderer_.removeAttribute(this.getItemByIndex(index).elementRef.nativeElement, attr);
    },
    getOffsetTopForOptionAtIndex: (index: number) => {
      return this.getItemByIndex(index).elementRef.nativeElement.offsetTop;
    },
    registerMenuInteractionHandler: (type: string, handler: EventListener) => {
      this.registry_.listen_(this.renderer_, type, handler, this.elementRef);
    },
    deregisterMenuInteractionHandler: (type: string, handler: EventListener) => {
      this.registry_.unlisten_(type, handler);
    },
    notifyChange: () => {
      this.change_.emit({
        index: this.foundation_.getSelectedIndex(),
        value: this.foundation_.getValue(),
      });
      this.controlValueAccessorChangeFn_(this.foundation_.getValue());
    },
    getWindowInnerHeight: () => isBrowser() ? window.innerHeight : 0,
  };

  private foundation_: {
    init: Function,
    destroy: Function,
    getValue: Function,
    getSelectedIndex: Function,
    setSelectedIndex: Function,
    isDisabled: Function,
    setDisabled: Function,
    resize: Function,
  } = new MDCSelectFoundation(this.mdcAdapter_);

  constructor(
    private renderer_: Renderer2,
    public elementRef: ElementRef,
    private registry_: EventRegistry) { }

  ngAfterViewInit() {
    this.foundation_.init();
    this.menuFactory_ = new MDCSimpleMenu(this.selectMenu.elementRef.nativeElement);
    this.resize();
  }

  ngOnDestroy() {
    this.foundation_.destroy();
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void) {
    this.controlValueAccessorChangeFn_ = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  getValue(): string {
    return this.foundation_.getValue();
  }

  getSelectedIndex(): number {
    return this.foundation_.getSelectedIndex();
  }

  setSelectedIndex(selectedIndex: number): void {
    this.foundation_.setSelectedIndex(selectedIndex);
  }

  isDisabled(): boolean {
    return this.foundation_.isDisabled();
  }

  setDisabled(disabled: boolean): void {
    this.foundation_.setDisabled(disabled);
  }

  resize(): void {
    this.foundation_.resize();
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  private getItemByIndex(index: number): MdcSelectItem | null {
    return this.options.toArray()[index];
  }
}
