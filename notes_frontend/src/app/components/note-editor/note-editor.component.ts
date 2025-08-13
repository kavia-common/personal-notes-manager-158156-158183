import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../models/note';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css'
})
export class NoteEditorComponent {
  @Input() note?: Note;
  @Output() save = new EventEmitter<Note>();
  @Output() delete = new EventEmitter<number>();

  onSave() {
    if (this.note) {
      this.save.emit(this.note);
    }
  }

  onDelete() {
    if (this.note?.id) {
      this.delete.emit(this.note.id);
    }
  }
}
