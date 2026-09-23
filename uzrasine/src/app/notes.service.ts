import { computed, Injectable, signal } from '@angular/core';

interface Note {
  readonly id: string;
  readonly title: string;
  readonly text: string;
}

const STORAGE_KEY = 'uzrasine.notes';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly errorState = signal<string | null>(null);
  private readonly notesState = signal<readonly Note[]>(this.load());

  readonly notes = this.notesState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly count = computed(() => this.notes().length);

  add(title: string, text: string): boolean {
    title = title.trim();
    text = text.trim();

    if (!title || !text) {
      return false;
    }

    const note: Note = { id: crypto.randomUUID(), title, text };
    return this.save([note, ...this.notes()]);
  }

  remove(id: string): void {
    this.save(this.notes().filter((note) => note.id !== id));
  }

  private save(notes: readonly Note[]): boolean {
    try {
      // Update the UI only after storage succeeds, so a failed save keeps the draft.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      this.notesState.set(notes);
      this.errorState.set(null);
      return true;
    } catch {
      this.errorState.set(
        'Nepavyko išsaugoti pakeitimų. Naršyklės atmintis pilna arba nepasiekiama. Bandykite dar kartą.',
      );
      return false;
    }
  }

  private load(): readonly Note[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        return [];
      }

      const notes: unknown = JSON.parse(stored);
      if (
        !Array.isArray(notes) ||
        !notes.every(isNote) ||
        new Set(notes.map((note) => note.id)).size !== notes.length
      ) {
        throw new Error('Invalid stored notes');
      }

      return notes;
    } catch {
      this.errorState.set('Nepavyko įkelti užrašų iš naršyklės atminties.');
      return [];
    }
  }
}

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const note = value as Record<string, unknown>;
  return ['id', 'title', 'text'].every(
    (key) => typeof note[key] === 'string' && note[key].trim().length > 0,
  );
}
