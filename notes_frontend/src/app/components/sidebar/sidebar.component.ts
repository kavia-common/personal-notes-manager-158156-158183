import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() newNote = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  onNewNote() {
    this.newNote.emit();
  }

  onSearch(query: string) {
    this.search.emit(query);
  }
}
