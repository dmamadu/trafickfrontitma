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
  // Colonnes absolument obligatoires (toujours requises)
  const mandatoryColumns = [
    'codePap', 
    'nom', 
    'prenom',
    'situationMatrimoniale',
    'membreFoyerHandicape', // Correction: 'membreFoyerHandicape' avec un 'c' ?
    'roleDansFoyer',
    'membreFoyer',
    'niveauEtude',
    'pointGeometriques',
    'sexe'
  ];

  // Vérification des colonnes obligatoires standard
  mandatoryColumns.forEach(column => {
    if (!this.headings.includes(column)) {
      this.validationErrors.push({
        type: 'COLUMN_MISSING',
        message: `La colonne "${column}" est obligatoire mais absente`
      });
    } else {
      this.checkEmptyValues(column);
    }
  });

  // Validation spécifique pour pointGeometriques (en dehors de la boucle)
  if (this.headings.includes('pointGeometriques')) {
    const invalidGeometryRows = this.dataExcel
      .map((row, index) => {
        if (!row.pointGeometriques) return index + 1;
        
        // Vérification du format strict
        const regex = /^Point\s\(-?\d+\.\d+\s-?\d+\.\d+\)$/;
        if (!regex.test(row.pointGeometriques)) {
          return index + 1;
        }
        return null;
      })
      .filter(index => index !== null);

    if (invalidGeometryRows.length > 0) {
      this.validationErrors.push({
        type: 'INVALID_GEOMETRY',
        message: 'La colonne "pointGeometriques" doit avoir le format "Point (longitude latitude)" sans virgule',
        rows: invalidGeometryRows
      });
    }
  }

  // Vérification conditionnelle pour age/dateNaissance
  const hasAge = this.headings.includes('age');
  const hasDateNaissance = this.headings.includes('dateNaissance');

  if (!hasAge && !hasDateNaissance) {
    this.validationErrors.push({
      type: 'CONDITIONAL_COLUMN_MISSING',
      message: 'Au moins une des colonnes "age" ou "dateNaissance" doit être présente'
    });
  } else {
    // Vérifier les valeurs vides seulement pour la colonne présente
    if (hasAge) this.checkEmptyValues('age');
    if (hasDateNaissance) this.checkEmptyValues('dateNaissance');
  }
}

// Méthode helper pour vérifier les valeurs vides
checkEmptyValues(column) {
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

  // validateRequiredColumns() {
  //   this.requiredColumns.forEach(column => {
  //     if (!this.headings.includes(column)) {
  //       this.validationErrors.push({
  //         type: 'COLUMN_MISSING',
  //         message: `La colonne "${column}" est obligatoire mais absente`
  //       });
  //     } else {
  //       const emptyRows = this.dataExcel
  //         .map((row, index) => (!row[column] ? index + 1 : null))
  //         .filter(index => index !== null);

  //       if (emptyRows.length > 0) {
  //         this.validationErrors.push({
  //           type: 'EMPTY_VALUES',
  //           message: `La colonne "${column}" contient des valeurs manquantes`,
  //           rows: emptyRows
  //         });
  //       }
  //     }
  //   });
  // }

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
