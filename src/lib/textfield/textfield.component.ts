import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  Provider,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { isBrowser } from '../common';
import { EventRegistry } from '../common/event-registry';

import { MdcIcon } from '../icon/icon.component';

import { MDCTextfieldAdapter } from './adapter';
import { MdcTextfieldInputDirective } from './textfield-input.directive';
import { MDCTextfieldFoundation } from '@material/textfield';

export const MD_TEXTFIELD_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdcTextfieldComponent),
  multi: true
};

// Invalid input type. Using one of these will throw an error.
const MD_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];

let nextUniqueId = 0;

@Directive({
  selector: '[mdc-textfield-helptext]'
})
export class MdcTextfieldHelptextDirective {
  @Input() id: string;
  @Input() persistent: boolean;
  @Input() validation: boolean;
  @HostBinding('class.mdc-textfield-helptext') isHostClass = true;
  @HostBinding('attr.aria-hidden') ariaHidden: string = 'true';
  @HostBinding('class.mdc-textfield-helptext--persistent') get classPersistent(): string {
    return this.persistent ? 'mdc-textfield-helptext--persistent' : '';
  }
  @HostBinding('class.mdc-textfield-helptext--validation-msg') get classValidation(): string {
    return this.validation ? 'mdc-textfield-helptext--validation-msg' : '';
  }

  constructor(public elementRef: ElementRef) { }
}

@Directive({
  selector: '[mdc-textfield-label], mdc-textfield-label'
})
export class MdcTextfieldLabelDirective {
  @HostBinding('class.mdc-textfield__label') isHostClass = true;

  constructor(public elementRef: ElementRef) { }
}

@Directive({
  selector: '[mdc-textfield-bottom-line], mdc-textfield-bottom-line'
})
export class MdcTextfieldBottomLine {
  @HostBinding('class.mdc-textfield__bottom-line') isHostClass = true;

  constructor(public elementRef: ElementRef) { }
}

@Component({
  selector: 'mdc-textfield',
  template:
  `
  <input mdc-textfield-input
    [type]="type"
    [id]="id"
    [placeholder]="placeholder"
    [tabindex]="tabindex"
    [disabled]="disabled"
    [attr.maxlength]="maxlength"
    [required]="required"
    (blur)="onBlur()"
    (input)="onInput($event)"
    (focus)="onFocus()" />
    <mdc-textfield-label [attr.for]="id">{{label}}</mdc-textfield-label>
    <mdc-textfield-bottom-line></mdc-textfield-bottom-line>
  `,
  encapsulation: ViewEncapsulation.None,
  providers: [
    MD_TEXTFIELD_CONTROL_VALUE_ACCESSOR,
    EventRegistry,
  ],
})
export class MdcTextfieldComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  private type_ = 'text';
  private disabled_: boolean = false;
  private required_: boolean = false;
  private controlValueAccessorChangeFn_: (value: any) => void = (value) => { };
  onChange = (_: any) => { };
  onTouched = () => { };

  @Input() id: string = `mdc-input-${nextUniqueId++}`;
  @Input() fullwidth: boolean;
  @Input() dense: boolean;
  @Input() label: string;
  @Input() maxlength: number;
  @Input() placeholder: string = '';
  @Input() tabindex: number;
  @Input()
  get disabled() { return this.disabled_; }
  set disabled(value: any) {
    this.disabled_ = value != null && `${value}` !== 'false';
    this.foundation_.setDisabled(value);
  }
  @Input()
  get required() { return this.required_; }
  set required(value: any) {
    this.required_ = value != null && `${value}` !== 'false';
  }
  @Input()
  get type(): string { return this.type_; }
  set type(value: string) {
    this.type_ = value || 'text';
    this.validateType_();

    if (!this.isTextarea_()) {
      this.renderer_.setProperty(this.inputText.elementRef.nativeElement, 'type', this.type_);
    }
  }
  @Input()
  get value(): string { return this.inputText.elementRef.nativeElement.value; }
  set value(value: string) {
    if (value !== this.value) {
      this.inputText.elementRef.nativeElement.value = value;
    }
  }
  get valid(): boolean {
    return (this.inputText.elementRef.nativeElement as HTMLInputElement).validity.valid;
  }
  @Output() iconAction = new EventEmitter<any>();
  @HostBinding('class.mdc-textfield') isHostClass = true;
  @HostBinding('class.mdc-textfield--dense') get classDense(): string {
    return this.dense ? 'mdc-textfield--dense' : '';
  }
  @HostBinding('class.mdc-textfield--fullwidth') get classFullwidth(): string {
    return this.fullwidth ? 'mdc-textfield--fullwidth' : '';
  }
  @ViewChild(MdcTextfieldInputDirective) inputText: MdcTextfieldInputDirective;
  @ViewChild(MdcTextfieldLabelDirective) inputLabel: MdcTextfieldLabelDirective;
  @ViewChild(MdcTextfieldHelptextDirective) inputHelpText: MdcTextfieldHelptextDirective;
  @ViewChild(MdcTextfieldBottomLine) bottomLine: MdcTextfieldBottomLine;

  private mdcAdapter_: MDCTextfieldAdapter = {
    addClass: (className: string) => {
      this.renderer_.addClass(this.elementRoot.nativeElement, className);
    },
    removeClass: (className: string) => {
      this.renderer_.removeClass(this.elementRoot.nativeElement, className);
    },
    addClassToLabel: (className: string) => {
      if (this.isTextarea_()) { return; }

      if (this.inputLabel && this.label) {
        this.renderer_.addClass(this.inputLabel.elementRef.nativeElement, className);
      }
    },
    removeClassFromLabel: (className: string) => {
      if (this.isTextarea_()) { return; }

      if (this.inputLabel && this.label) {
        this.renderer_.removeClass(this.inputLabel.elementRef.nativeElement, className);
      }
    },
    setIconAttr: (name: string, value: string) => {

    },
    eventTargetHasClass: (target: HTMLElement, className: string) => {
      return target.classList.contains(className);
    },
    registerTextFieldInteractionHandler: (evtType: string, handler: EventListener) => {
      this.registry_.listen_(this.renderer_, evtType, handler, this.elementRoot);
    },
    deregisterTextFieldInteractionHandler: (evtType: string, handler: EventListener) => {
      this.registry_.unlisten_(evtType, handler);
    },
    notifyIconAction: () => {
      this.iconAction.emit({
        source: this
      });
    },
    addClassToBottomLine: (className: string) => {
      if (this.bottomLine) {
        this.renderer_.addClass(this.bottomLine, className);
      }
    },
    removeClassFromBottomLine: (className: string) => {
      if (this.bottomLine) {
        this.renderer_.removeClass(this.bottomLine, className);
      }
    },
    addClassToHelptext: (className: string) => {
      if (this.inputHelpText) {
        this.renderer_.addClass(this.inputHelpText, className);
      }
    },
    removeClassFromHelptext: (className: string) => {
      if (this.inputHelpText) {
        this.renderer_.removeClass(this.inputHelpText, className);
      }
    },
    helptextHasClass: (className: string) => {
      return this.inputHelpText ? this.inputHelpText.elementRef.nativeElement.classList.contains(className) : false;
    },
    registerInputInteractionHandler: (evtType: string, handler: EventListener) => {
      this.registry_.listen_(this.renderer_, evtType, handler, this.inputText.elementRef);
    },
    deregisterInputInteractionHandler: (evtType: string, handler: EventListener) => {
      this.registry_.unlisten_(evtType, handler);
    },
    registerTransitionEndHandler: (handler: EventListener) => {
      this.registry_.listen_(this.renderer_, 'transitionend', handler, this.bottomLine.elementRef.nativeElement);
    },
    deregisterTransitionEndHandler: (handler: EventListener) => {
      this.registry_.unlisten_('transitionend', handler);
    },
    setBottomLineAttr: (attr: string, value: string) => {
      if (this.bottomLine) {
        this.renderer_.setAttribute(this.bottomLine.elementRef, attr, value);
      }
    },
    setHelptextAttr: (name: string, value: string) => {
      if (this.inputHelpText) {
        this.renderer_.setAttribute(this.inputHelpText.elementRef.nativeElement, name, value);
      }
    },
    removeHelptextAttr: (name: string) => {
      if (this.inputHelpText) {
        this.renderer_.removeAttribute(this.inputHelpText.elementRef.nativeElement, name);
      }
    },
    getNativeInput: () => {
      return {
        checkValidity: () => this.inputText.elementRef.nativeElement.validity.valid,
        value: this.value,
        disabled: this.disabled,
        badInput: this.isBadInput(),
      };
    }
  };

  private foundation_: {
    init: Function,
    destroy: Function,
    isDisabled: Function,
    setDisabled: Function,
    setValid: Function,
  } = new MDCTextfieldFoundation(this.mdcAdapter_);

  constructor(
    private renderer_: Renderer2,
    public elementRoot: ElementRef,
    private registry_: EventRegistry) { }

  ngAfterViewInit() {
    this.foundation_.init();
  }

  ngOnDestroy() {
    this.foundation_.destroy();
  }

  writeValue(value: string) {
    this.value = value == null ? '' : value;
    if (this.value.length > 0) {
      this.mdcAdapter_.addClassToLabel('mdc-textfield__label--float-above');
    } else {
      this.mdcAdapter_.removeClassFromLabel('mdc-textfield__label--float-above');
    }
    this.onChange(value);
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  onFocus() {
    this.inputText.focused = true;
  }

  onInput(evt: Event) {
    this.onChange((<any>evt.target).value);
  }

  onBlur() {
    this.inputText.focused = false;
    this.onTouched();
  }

  isDisabled(): boolean {
    return this.foundation_.isDisabled();
  }

  isBadInput(): boolean {
    return (this.inputText.elementRef.nativeElement as HTMLInputElement).validity.badInput;
  }

  focus(): void {
    this.inputText.focus();
  }

  setValid(value?: boolean): void {
    this.foundation_.setValid(value ? value : this.valid);
  }

  private isTextarea_() {
    let nativeElement = this.elementRoot.nativeElement;
    let nodeName = isBrowser ? nativeElement.nodeName : nativeElement.name;
    return nodeName ? nodeName.toLowerCase() === 'textarea' : false;
  }

  private validateType_() {
    if (MD_INPUT_INVALID_TYPES.indexOf(this.type_) > -1) {
      throw Error(`Input type "${this.type_}" is not supported.`);
    }
  }
}
