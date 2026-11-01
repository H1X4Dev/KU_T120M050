import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-company-new',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './company-new.html',
  styleUrl: './company-new.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyNew {
  private readonly builder = inject(NonNullableFormBuilder);
  protected readonly form = this.builder.group({
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(/.*\S.*/)]],
    companyCode: ['', Validators.pattern(/^[0-9]+$/)],
    vatCode: ['', this.validateVatCode],
    address: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(/^\+370[0-9]{6,8}$/)],
    contacts: this.builder.array([this.createContact()]),
  });

  protected get contacts() {
    return this.form.controls.contacts;
  }

  private createContact() {
    const requiredText = [Validators.required, Validators.pattern(/.*\S.*/)];
    return this.builder.group({
      firstName: ['', requiredText],
      lastName: ['', requiredText],
      position: ['', requiredText],
      phone: ['', requiredText],
    });
  }

  private validateVatCode(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value;
    return !value || /^(?:LT)?[0-9]+$/.test(value) ? null : { vatCode: true };
  }

  protected addContact(): void {
    this.contacts.push(this.createContact());
  }

  protected removeContact(index: number): void {
    if (this.contacts.length > 1) {
      this.contacts.removeAt(index);
    }
  }

  protected register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log(this.form.getRawValue());
  }
}
