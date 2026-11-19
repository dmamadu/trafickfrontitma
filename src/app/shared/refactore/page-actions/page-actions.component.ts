import { MatIconModule } from "@angular/material/icon";
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
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './page-actions.component.html',
  styleUrls: ['./page-actions.component.css']
})
export class PageActionsComponent {
  @Input() title: string = '';
  /** Phrase d'explication facultative sous le titre. */
  @Input() subtitle: string = '';
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

  /** Classe d'icône (Boxicons, MDI, Font Awesome) plutôt que nom d'icône Material ? */
  estClasseIcone(icon: string): boolean {
    return /(^|\s)(bx|bxs|mdi|fa|fas|far)(\s|-|$)/.test(icon ?? '');
  }

  /** Nom d'icône Material, avec quelques alias utilisés par les écrans (« plus », « file-pdf »…). */
  nomIconeMaterial(icon: string): string {
    const alias: Record<string, string> = {
      plus: 'add',
      'file-excel': 'upload_file',
      'table-chart': 'table_chart',
      'file-pdf': 'picture_as_pdf',
      download: 'download',
      upload: 'upload',
    };
    return alias[icon] ?? icon;
  }

  handleSearchInput(event: any): void {
    this.searchValue = event.target?.value ?? '';
    this.onSearch.emit(this.searchValue);
  }

  handleAction(action: string): void {
    this.onAction.emit(action);
  }
}