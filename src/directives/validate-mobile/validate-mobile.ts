import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from "@angular/forms";
import {ValidateMobile} from "../../validators/mobile-validator";

@Directive({
  selector: '[validateMobile]', // Attribute selector
  providers: [{provide: NG_VALIDATORS, useExisting: ValidateMobileDirective, multi: true}]
})
export class ValidateMobileDirective implements Validator {
  @Input() countryCode: string;

  constructor() {}

  validate(control: AbstractControl): { [key: string]: any; } {
    console.log('control', control);
    console.log('country code', this.countryCode);
    // TODO: remove country code on cancel
    // +11-202-555-0111
    // 9160511120
    return ValidateMobile(this.countryCode)(control);
  }
}
