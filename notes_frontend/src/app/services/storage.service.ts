import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly NOTES_KEY = 'cached_notes';
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getStorage(): Storage | null {
    try {
      return this.isBrowser && typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }

  getCachedNotes(): Note[] {
    const storage = this.getStorage();
    if (!storage) return [];
    
    try {
      const notesJson = storage.getItem(this.NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  }

  cacheNotes(notes: Note[]): void {
    const storage = this.getStorage();
    if (!storage) return;
    
    try {
      storage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  searchCachedNotes(query: string): Note[] {
    const notes = this.getCachedNotes();
    const searchTerm = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  }
}
