import {AbstractControl, ValidatorFn} from "@angular/forms";
import {getNumberType, isValidNumber, parse, ParsedNumber} from "libphonenumber-js";
export function ValidateMobile(countryCode?): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    if (countryCode === "") {
      return {'invalidCountryCode': true};
    }

    console.log('control value type', typeof control.value);
    console.log(countryCode)
    let parsedNumber: ParsedNumber = parse(control.value);

    console.log('control value', '+' + countryCode + control.value);
    if (control.value && !control.value.startsWith(countryCode)) {
      parsedNumber = parse('+' + countryCode + control.value);
    }


    if (getNumberType(parsedNumber) && getNumberType(parsedNumber) === 'FIXED_LINE') {
      return {'invalidNumber': true};
    }

    return !isValidNumber(parsedNumber) ? {'invalidNumber': true} : null;
  }
}
