import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NotesService } from './notes.service';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly dialog = inject(MatDialog);
  private dialogRef?: MatDialogRef<unknown>;

  protected readonly notesService = inject(NotesService);
  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.pattern(/\S/)]],
    text: ['', [Validators.required, Validators.pattern(/\S/)]],
  });

  protected openNoteDialog(template: TemplateRef<unknown>): void {
    this.form.reset();
    this.dialogRef = this.dialog.open(template);
  }

  protected addNote(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, text } = this.form.getRawValue();
    if (this.notesService.add(title, text)) {
      this.dialogRef?.close();
    }
  }
}
