import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  standalone: true,
  imports:[CommonModule],
  //styleUrls: ['./datatable.component.scss']
})

export class DatatableComponent {
  @Input() headings: string[] = [];
  @Input() dataExcel: any[] = [];
  selectedRows: any[] = [];
  open = false;
  validationErrors: {type: string, message: string, rows?: number[]}[] = [];

  // Colonnes obligatoires
  requiredColumns = ['codePap', 'nom', 'prenom'];

  ngOnInit() {
    this.validateData();
  }

  ngOnChanges() {
    this.validateData();
  }

  validateData() {
    this.validationErrors = [];

    // Vérifier les colonnes obligatoires
    this.validateRequiredColumns();

    // Vérifier les doublons
    this.validateDuplicates();
  }

  validateRequiredColumns() {
    this.requiredColumns.forEach(column => {
      if (!this.headings.includes(column)) {
        this.validationErrors.push({
          type: 'COLUMN_MISSING',
          message: `La colonne "${column}" est obligatoire mais absente`
        });
      } else {
        const emptyRows = this.dataExcel
          .map((row, index) => (!row[column] ? index + 1 : null))
          .filter(index => index !== null);

        if (emptyRows.length > 0) {
          this.validationErrors.push({
            type: 'EMPTY_VALUES',
            message: `La colonne "${column}" contient des valeurs manquantes`,
            rows: emptyRows
          });
        }
      }
    });
  }

  validateDuplicates() {
    if (!this.headings.includes('codePap')) return;

    const codePapCounts: {[key: string]: number[]} = {};

    this.dataExcel.forEach((row, index) => {
      const code = row['codePap'];
      if (code) {
        if (!codePapCounts[code]) {
          codePapCounts[code] = [];
        }
        codePapCounts[code].push(index + 1); // +1 pour la numérotation humaine
      }
    });

    Object.entries(codePapCounts).forEach(([code, rows]) => {
      if (rows.length > 1) {
        this.validationErrors.push({
          type: 'DUPLICATE_CODE',
          message: `Le codePap "${code}" est dupliqué`,
          rows: rows
        });
      }
    });
  }

  hasErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  getErrorMessages(): string[] {
    return this.validationErrors.map(error => {
      if (error.rows) {
        return `${error.message} (Lignes: ${error.rows.join(', ')})`;
      }
      return error.message;
    });
  }

  toggleDropdown() {
    this.open = !this.open;
  }

  toggleColumn(columnKey: string) {
    const column = document.querySelector(`.${columnKey}`);
    column?.classList.toggle('hidden');
  }

  selectAllCheckbox(event: any) {
    const checkboxes = document.querySelectorAll('.rowCheckbox');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = event.target.checked;
    });
    this.selectedRows = event.target.checked ? [...this.dataExcel] : [];
  }

  getRowDetail(event: any, row: any) {
    if (event.target.checked) {
      this.selectedRows.push(row);
    } else {
      const index = this.selectedRows.findIndex(r => r === row);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      }
    }
  }
}
