import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

export interface Note {
  readonly id: string;
  readonly title: string;
  readonly text: string;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly destroyRef = inject(DestroyRef);
  private connection?: Awaited<ReturnType<typeof import('./notes.firebase').connectNotes>>;
  private unsubscribe?: () => void;
  private readonly notesState = signal<readonly Note[]>([]);
  private readonly errorState = signal<string | null>(null);
  private readonly loadingState = signal(false);
  private readonly readyState = signal(false);
  private readonly savingState = signal(false);
  private readonly deletingState = signal<readonly string[]>([]);

  readonly notes = this.notesState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly saving = this.savingState.asReadonly();
  readonly deleting = this.deletingState.asReadonly();
  readonly count = computed(() => this.notes().length);

  constructor() {
    void this.connect();
    this.destroyRef.onDestroy(() => this.unsubscribe?.());
  }

  async connect(): Promise<void> {
    if (this.loading()) {
      return;
    }

    this.unsubscribe?.();
    this.loadingState.set(true);
    this.readyState.set(false);
    this.errorState.set(null);

    try {
      const { connectNotes } = await import('./notes.firebase');
      this.connection = await connectNotes();
      if (this.destroyRef.destroyed) {
        return;
      }

      this.unsubscribe = this.connection.listen(
        (notes) => {
          this.notesState.set(notes);
          this.loadingState.set(false);
          this.readyState.set(true);
        },
        (error) => this.connectionFailed(error),
      );
    } catch (error) {
      this.connectionFailed(error);
    }
  }

  async add(title: string, text: string): Promise<boolean> {
    title = title.trim();
    text = text.trim();
    if (
      !title ||
      !text ||
      title.length > 200 ||
      text.length > 20000 ||
      !this.ready() ||
      !this.connection ||
      this.saving()
    ) {
      return false;
    }

    this.savingState.set(true);
    this.errorState.set(null);
    try {
      await this.connection.add(title, text);
      return true;
    } catch {
      this.errorState.set('Nepavyko išsaugoti užrašo. Bandykite dar kartą.');
      return false;
    } finally {
      this.savingState.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    if (!this.ready() || !this.connection || this.deleting().includes(id)) {
      return;
    }

    this.deletingState.update((ids) => [...ids, id]);
    this.errorState.set(null);
    try {
      await this.connection.remove(id);
    } catch {
      this.errorState.set('Nepavyko ištrinti užrašo. Bandykite dar kartą.');
    } finally {
      this.deletingState.update((ids) => ids.filter((pendingId) => pendingId !== id));
    }
  }

  private connectionFailed(error: unknown): void {
    console.error('Firebase notes connection failed:', error);
    this.loadingState.set(false);
    this.readyState.set(false);
    this.errorState.set(
      'Nepavyko prisijungti prie užrašų saugyklos. Patikrinkite interneto ryšį ir bandykite dar kartą.',
    );
  }
}
