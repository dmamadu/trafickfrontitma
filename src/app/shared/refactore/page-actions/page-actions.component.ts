import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ActionButton {
  label: string;
  icon: string;
  action: string;
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  disabled?: boolean;
  visible?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  active?: boolean;
  link?: string;
}

@Component({
  selector: 'app-page-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-actions.component.html',
  styleUrls: ['./page-actions.component.css']
})
export class PageActionsComponent {
  @Input() title: string = '';
  @Input() icon: string = 'bx-home';         // ← variable, ex: 'bx-user-circle'
  @Input() breadcrumbItems: BreadcrumbItem[] = [];
  @Input() searchPlaceholder: string = 'Rechercher...';
  @Input() showSearch: boolean = true;
  @Input() actions: ActionButton[] = [];

  @Output() onSearch = new EventEmitter<string>();
  @Output() onAction = new EventEmitter<string>();

  searchValue: string = '';

  get visibleActions(): ActionButton[] {
    return this.actions.filter(a => a.visible !== false);
  }

  handleSearchInput(event: any): void {
    this.searchValue = event.target?.value ?? '';
    this.onSearch.emit(this.searchValue);
  }

  handleAction(action: string): void {
    this.onAction.emit(action);
  }
}