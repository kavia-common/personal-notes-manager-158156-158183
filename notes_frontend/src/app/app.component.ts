import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { NotesService } from './services/notes.service';
import { StorageService } from './services/storage.service';
import { Note } from './models/note';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    SidebarComponent,
    NotesListComponent,
    NoteEditorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  notes: Note[] = [];
  selectedNote?: Note;
  error?: string;

  constructor(
    private notesService: NotesService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.error = undefined;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.error = 'Failed to load notes. Please try again later.';
        // Load cached notes if available
        const cachedNotes = this.storageService.getCachedNotes();
        if (cachedNotes.length > 0) {
          this.notes = cachedNotes;
          this.error = 'Using cached notes (offline mode)';
        }
      }
    });
  }

  createNewNote(): void {
    this.selectedNote = {
      title: '',
      content: ''
    };
  }

  selectNote(note: Note): void {
    this.selectedNote = { ...note };
  }

  saveNote(note: Note): void {
    const saveOperation = note.id 
      ? this.notesService.updateNote(note.id, note)
      : this.notesService.createNote(note);

    saveOperation.subscribe({
      next: (savedNote) => {
        this.loadNotes();
        this.error = undefined;
        // Cache the notes
        this.storageService.cacheNotes([...this.notes, savedNote]);
      },
      error: (err) => {
        console.error('Error saving note:', err);
        this.error = 'Failed to save note. Changes will be cached locally.';
        // Cache the note locally
        if (!note.id) {
          note.id = Date.now(); // Temporary ID for offline mode
        }
        const updatedNotes = [...this.notes];
        const index = updatedNotes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          updatedNotes[index] = note;
        } else {
          updatedNotes.push(note);
        }
        this.notes = updatedNotes;
        this.storageService.cacheNotes(updatedNotes);
      }
    });
  }

  deleteNote(id: number): void {
    this.notesService.deleteNote(id).subscribe({
      next: () => {
        const updatedNotes = this.notes.filter(note => note.id !== id);
        this.notes = updatedNotes;
        this.selectedNote = undefined;
        this.error = undefined;
        this.storageService.cacheNotes(updatedNotes);
      },
      error: (err) => {
        console.error('Error deleting note:', err);
        this.error = 'Failed to delete note from server. Removing from local cache.';
        // Remove from local cache
        const updatedNotes = this.notes.filter(note => note.id !== id);
        this.notes = updatedNotes;
        this.selectedNote = undefined;
        this.storageService.cacheNotes(updatedNotes);
      }
    });
  }

  searchNotes(query: string): void {
    if (query) {
      this.notesService.searchNotes(query).subscribe({
        next: (notes) => {
          this.notes = notes;
          this.error = undefined;
        },
        error: (err) => {
          console.error('Error searching notes:', err);
          this.error = 'Failed to search on server. Searching in cached notes.';
          // Search in cached notes
          this.notes = this.storageService.searchCachedNotes(query);
        }
      });
    } else {
      this.loadNotes();
    }
  }
}
