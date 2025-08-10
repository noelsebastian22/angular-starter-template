import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
} from '@angular/forms';
import {
  MatFormFieldModule,
  MatFormFieldAppearance,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseInput } from '@infrastructure/abstracts/base-input.abstract';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TextInputComponent,
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: TextInputComponent, multi: true },
  ],
  templateUrl: './text-input.component.html',
})
export class TextInputComponent extends BaseInput<string> {
  @Input() control?: AbstractControl | null;
  @Input() showErrorsOn: 'touched' | 'dirty' = 'touched';

  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' =
    'text';
  @Input() autocomplete?: string;
  @Input() readonly = false;

  /** Password-specific options */
  @Input() passwordToggle = true;
  @Input() showPasswordAriaLabel = 'Show password';
  @Input() hidePasswordAriaLabel = 'Hide password';
  /** Set to "new-password" at usage time if it’s a signup/reset field */
  @Input() passwordAutocompleteDefault: 'current-password' | 'new-password' =
    'current-password';

  showPassword = false;
  capsLockOn = false;

  get isPasswordType() {
    return this.type === 'password';
  }
  get effectiveType() {
    return this.isPasswordType && this.showPassword ? 'text' : this.type;
  }

  get autocompleteAttr(): string | null {
    if (this.autocomplete) return this.autocomplete;
    return this.isPasswordType ? this.passwordAutocompleteDefault : null;
  }

  get patternAsString(): string | null {
    if (!this.pattern) return null;
    return typeof this.pattern === 'string'
      ? this.pattern
      : this.pattern.source;
  }

  get showErrors(): boolean {
    const c = this.control;
    const hasErrors = !!(c?.errors ?? (c ? this.validate(c) : null));
    const gate =
      this.showErrorsOn === 'dirty'
        ? (c?.dirty ?? false)
        : (c?.touched ?? this.touched);
    return hasErrors && gate;
  }

  get errors(): string[] {
    return this.errorList(this.control ?? null);
  }

  onNativeInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.onInput(target?.value ?? '');
  }

  onKeydown(event: KeyboardEvent) {
    // best-effort; some browsers/platforms may not support this
    this.capsLockOn =
      !!event.getModifierState && event.getModifierState('CapsLock');
  }

  toggleVisibility() {
    this.showPassword = !this.showPassword;
  }

  onInput(v: string) {
    this.updateValue(v);
  }
  onBlur() {
    this.markAsTouched();
  }
}
