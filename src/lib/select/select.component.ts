// import {
//   Component,
//   Directive,
//   ContentChildren,
//   ElementRef,
//   HostBinding,
//   Input,
//   QueryList,
//   Renderer2,
//   ViewEncapsulation,
// } from '@angular/core';
// import { toBoolean } from '../common';
// import { EventRegistry } from '../common/event-registry';

// import {
//   ListItemDirective,
//   ListDividerComponent,
//   ListGroupDirective,
//   ListGroupSubheaderDirective
// } from '../list';

// import { MenuComponent } from '../menu';

// import { MDCSelectAdapter } from './select-adapter';
// import { MDCSelectFoundation } from '@material/select';

// @Directive({
//   selector: '[mdc-selected-text]'
// })
// export class SelectedText {
//   @HostBinding('class.mdc-select__selected-text') isHostClass = true;

//   constructor(public elementRef: ElementRef) { }
// }

// @Component({
//   selector: 'mdc-select',
//   template: `<ng-content></ng-content>`,
//   encapsulation: ViewEncapsulation.None
// })
// export class SelectComponent {
//   @HostBinding('class.mdc-select') isHostClass = true;
//   @HostBinding('attr.role') role: string = 'listbox';
//   @ContentChildren(ListItemDirective) items: QueryList<ListItemDirective>;

//   private _mdcAdapter: MDCSelectAdapter = {
//     addClass: (className: string) => {
//       this._renderer.addClass(this._root.nativeElement, className);
//     },
//     removeClass: (className: string) => {
//       this._renderer.removeClass(this._root.nativeElement, className);
//     },
//     setAttr: (attr: string, value: string) => void,
//     rmAttr: (attr: string) => void,
//     computeBoundingRect: () => { left: number, top: number },
//     registerInteractionHandler: (type: string, handler: EventListener) => {
//       if (this._root) {
//         this._registry.listen_(this._renderer, type, handler, this._root);
//       }
//     },
//     deregisterInteractionHandler: (type: string, handler: EventListener) => {
//       this._registry.unlisten_(type, handler);
//     },
//     focus: () => this._root.nativeElement.focus(),
//     makeTabbable: () => this._root.nativeElement.tabIndex = 0,
//     makeUntabbable: () => this._root.nativeElement.tabIndex = -1,
//     getComputedStyleValue: (propertyName: string) => string,
//     setStyle: (propertyName: string, value: string) => void,
//     create2dRenderingContext: () => { font: string, measureText: () => { width: number } },
//     setMenuElStyle: (propertyName: string, value: string) => void,
//     setMenuElAttr: (attr: string, value: string) => void,
//     rmMenuElAttr: (attr: string) => void,
//     getMenuElOffsetHeight: () => number,
//     openMenu: (focusIndex: number) => void,
//     isMenuOpen: () => boolean,
//     setSelectedTextContent: (textContent: string) => void,
//     getNumberOfOptions: () => number,
//     getTextForOptionAtIndex: (index: number) => string,
//     getValueForOptionAtIndex: (index: number) => string,
//     setAttrForOptionAtIndex: (index: number, attr: string, value: string) => void,
//     rmAttrForOptionAtIndex: (index: number, attr: string) => void,
//     getOffsetTopForOptionAtIndex: (index: number) => number,
//     registerMenuInteractionHandler: (type: string, handler: EventListener) => void,
//     deregisterMenuInteractionHandler: (type: string, handler: EventListener) => void,
//     notifyChange: () => void,
//     getWindowInnerHeight: () => number,
//   };

//   private _foundation: {
//     init: Function,
//     destroy: Function,
//     getValue: Function,
//     getSelectedIndex: Function,
//     setSelectedIndex: Function,
//     isDisabled: Function,
//     setDisabled: Function,
//     resize: Function,
//   } = new MDCSelectFoundation(this._mdcAdapter);

//   constructor(
//     private _renderer: Renderer2,
//     private _root: ElementRef,
//     private _registry: EventRegistry) { }

//   ngAfterViewInit() {
//     this._foundation.init();
//   }
//   ngOnDestroy() {
//     this._foundation.destroy();
//   }
// }
