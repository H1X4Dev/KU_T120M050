import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  svoris: number | null = null;
  ugis: number | null = null;
  kmi: number | null = null;

  skaiciuoti() {
    if (this.svoris && this.ugis) {
      this.kmi = this.svoris / (this.ugis / 100) ** 2;
    }
  }
}
