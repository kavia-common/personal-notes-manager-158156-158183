import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Note } from '../models/note';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = 'http://localhost:8000/api/notes';
  private _http: HttpClient;
  private _storage: StorageService;

  constructor(http: HttpClient, storage: StorageService) {
    this._http = http;
    this._storage = storage;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }

  getNotes(): Observable<Note[]> {
    return this._http.get<Note[]>(this.apiUrl)
      .pipe(
        tap(notes => {
          this._storage.cacheNotes(notes);
        }),
        catchError(this.handleError)
      );
  }

  getNote(id: number): Observable<Note> {
    return this._http.get<Note>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createNote(note: Note): Observable<Note> {
    return this._http.post<Note>(this.apiUrl, note)
      .pipe(catchError(this.handleError));
  }

  updateNote(id: number, note: Note): Observable<Note> {
    return this._http.put<Note>(`${this.apiUrl}/${id}`, note)
      .pipe(catchError(this.handleError));
  }

  deleteNote(id: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  searchNotes(query: string): Observable<Note[]> {
    return this._http.get<Note[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`)
      .pipe(catchError(this.handleError));
  }
}
