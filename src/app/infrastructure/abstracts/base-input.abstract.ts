import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

/**
 * BaseInput<T>
 * - Tiny, scalable foundation for custom form controls.
 * - Implements CVA + a small, optional validator set.
 * - Child components should call:
 *     this.updateValue(next) on change,
 *     this.markAsTouched() on blur.
 */
@Directive({
  selector: '[appBaseInput]',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: BaseInput, multi: true },
    { provide: NG_VALIDATORS, useExisting: BaseInput, multi: true },
  ],
})
export abstract class BaseInput<T> implements ControlValueAccessor, Validator {
  // Common UI bits any input might need
  @Input() id = `in_${Math.random().toString(36).slice(2)}`;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';

  // Simple constraints (opt-in)
  @Input() required = false;
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() pattern?: string | RegExp;

  // Optional custom messages (override per control if you like)
  @Input() errorMessages: Partial<Record<string, string>> = {
    required: 'This field is required.',
    minlength: 'Too short.',
    maxlength: 'Too long.',
    pattern: 'Invalid format.',
  };

  // Internal state (CVA)
  protected _value: T | null = null;
  protected touched = false;
  disabled = false;

  // CVA hooks (wired by Angular) — optional to avoid empty-function rule
  protected onChange?: (val: T | null) => void;
  protected onTouched?: () => void;

  // ---- ControlValueAccessor ----
  writeValue(value: T | null): void {
    this._value = value;
    // optional hook for subclasses
    this.onValueWritten?.(value);
  }
  /** Optional hook for subclasses (replaces empty `afterWriteValue`) */
  protected onValueWritten?(value: T | null): void;

  registerOnChange(fn: (v: T | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ---- Validator (simple, string-like) ----
  validate(control: AbstractControl): ValidationErrors | null {
    // Prefer the control's current value; fall back to CVA value
    const s = String(
      (control?.value ?? this._value ?? '') as unknown as string,
    );

    if (this.required && !s) return { required: true };
    if (this.minlength != null && s.length < this.minlength) {
      return {
        minlength: { requiredLength: this.minlength, actualLength: s.length },
      };
    }
    if (this.maxlength != null && s.length > this.maxlength) {
      return {
        maxlength: { requiredLength: this.maxlength, actualLength: s.length },
      };
    }
    if (this.pattern) {
      const rx =
        typeof this.pattern === 'string'
          ? new RegExp(this.pattern)
          : this.pattern;
      if (s && !rx.test(s)) return { pattern: true };
    }
    return null;
  }

  // ---- Helpers for children ----
  protected updateValue(next: T | null): void {
    this._value = next;
    this.onChange?.(next);
  }

  protected markAsTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched?.();
    }
  }

  /** Optional helper to turn current errors into strings for UI */
  protected errorList(ctrl: AbstractControl | null): string[] {
    const errs =
      ctrl?.errors ??
      this.validate(ctrl ?? ({ value: this._value } as AbstractControl));
    if (!errs) return [];

    const out: string[] = [];
    if ('required' in errs)
      out.push(this.errorMessages['required'] ?? 'This field is required.');
    if ('pattern' in errs)
      out.push(this.errorMessages['pattern'] ?? 'Invalid format.');

    const min = errs['minlength'] as { requiredLength?: number } | undefined;
    if (min?.requiredLength != null) {
      out.push(
        `${this.errorMessages['minlength'] ?? 'Too short.'} Min ${min.requiredLength} chars.`,
      );
    }
    const max = errs['maxlength'] as { requiredLength?: number } | undefined;
    if (max?.requiredLength != null) {
      out.push(
        `${this.errorMessages['maxlength'] ?? 'Too long.'} Max ${max.requiredLength} chars.`,
      );
    }
    return out;
  }
}
