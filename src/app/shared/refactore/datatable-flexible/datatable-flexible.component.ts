import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-datatable-flexible',
  templateUrl: './datatable-flexible.component.html',
  standalone: true,
  imports:[CommonModule],
})
export class DatatableFlexibleComponent {
  @Input() headings: string[] = [];
  @Input() dataExcel: any[] = [];
  
  validationErrors: {type: string, message: string, rows?: number[], severity?: 'error' | 'warning' | 'info'}[] = [];

  ngOnInit() {
    this.validateData();
  }

  ngOnChanges() {
    this.validateData();
  }

  validateData() {
    this.validationErrors = [];
    this.validateRequiredColumns();
    this.validateDuplicates();
    this.validateStatutCompletion();
  }

  validateRequiredColumns() {
    // Seul codePap est obligatoire
    if (!this.headings.includes('codePap')) {
      this.validationErrors.push({
        type: 'COLUMN_MISSING',
        message: 'La colonne "codePap" est obligatoire',
        severity: 'error'
      });
      return;
    }

    // Vérifier valeurs vides pour codePap
    const emptyCodePapRows = this.dataExcel
      .map((row, index) => (row['codePap'] === undefined || row['codePap'] === null || row['codePap'] === '' ? index + 1 : null))
      .filter(index => index !== null);

    if (emptyCodePapRows.length > 0) {
      this.validationErrors.push({
        type: 'EMPTY_VALUES',
        message: `"codePap" contient des valeurs manquantes`,
        rows: emptyCodePapRows,
        severity: 'error'
      });
    }

    // Validation stricte pour les PAP avec statut "complet"
    this.validateCompletPapFields();
  }

  validateCompletPapFields() {
    // Colonnes obligatoires pour les PAP complets
    const mandatoryColumnsForComplet = [
      'nom', 
      'prenom',
      'sexe',
      'situationMatrimoniale',
      'membreFoyer',
      'membreFoyerHandicape',
      'niveauEtude',
      'pointGeometriques'
    ];

    // Grouper les erreurs par colonne pour éviter la duplication
    const errorsByColumn: {[key: string]: number[]} = {};

    this.dataExcel.forEach((row, index) => {
      const statut = (row['statutCompletion'] || '').toString().toLowerCase().trim();
      
      // Si statut est "complet", vérifier tous les champs obligatoires
      if (statut === 'complet') {
        mandatoryColumnsForComplet.forEach(column => {
          // Vérifier si la colonne existe
          if (!this.headings.includes(column)) {
            if (!errorsByColumn[`MISSING_COLUMN_${column}`]) {
              this.validationErrors.push({
                type: 'COLUMN_MISSING',
                message: `La colonne "${column}" est obligatoire pour les PAP complets`,
                severity: 'error'
              });
              errorsByColumn[`MISSING_COLUMN_${column}`] = []; // Marquer comme ajouté
            }
          } else {
            // Vérifier si la valeur est vide
            const value = row[column];
            if (value === undefined || value === null || value === '') {
              if (!errorsByColumn[column]) {
                errorsByColumn[column] = [];
              }
              errorsByColumn[column].push(index + 1);
            }
          }
        });
      }
    });

    // Ajouter les erreurs de valeurs manquantes
    Object.entries(errorsByColumn).forEach(([column, rows]) => {
      if (rows.length > 0 && !column.startsWith('MISSING_COLUMN_')) {
        this.validationErrors.push({
          type: 'EMPTY_VALUES_COMPLET',
          message: `"${column}" est obligatoire pour les PAP complets`,
          rows: rows,
          severity: 'error'
        });
      }
    });

    // Validation géométrie pour PAP complets
    this.validateGeometryForComplet();
  }

  validateGeometryForComplet() {
    if (!this.headings.includes('pointGeometriques')) return;

    const invalidGeometryRows = this.dataExcel
      .map((row, index) => {
        const statut = (row['statutCompletion'] || '').toString().toLowerCase().trim();
        
        // Vérifier uniquement pour les PAP complets
        if (statut === 'complet') {
          if (!row.pointGeometriques) return index + 1;
          
          const pointRegex = /^Point\s*\(\s*-?\d+\.?\d*\s+-?\d+\.?\d*\s*\)$/;
          const multiPolygonRegex = /^MultiPolygon\s*\(\s*\(\s*\(\s*(-?\d+\.?\d*\s+-?\d+\.?\d*(?:\s*,\s*-?\d+\.?\d*\s+-?\d+\.?\d*)*)\s*\)\s*\)\s*\)$/;
          
          if (!pointRegex.test(row.pointGeometriques) && !multiPolygonRegex.test(row.pointGeometriques)) {
            return index + 1;
          }
          
          if (row.pointGeometriques.startsWith('MultiPolygon')) {
            const coordsMatch = row.pointGeometriques.match(multiPolygonRegex);
            if (!coordsMatch) return index + 1;
            
            const coords = coordsMatch[1].split(/\s*,\s*/);
            if (coords.length < 4 || coords[0] !== coords[coords.length - 1]) {
              return index + 1;
            }
          }
        }
        
        return null;
      })
      .filter(index => index !== null);

    if (invalidGeometryRows.length > 0) {
      this.validationErrors.push({
        type: 'INVALID_GEOMETRY',
        message: 'Format géométrie invalide pour PAP complets (Point ou MultiPolygon requis)',
        rows: invalidGeometryRows,
        severity: 'error'
      });
    }
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
        codePapCounts[code].push(index + 1);
      }
    });

    Object.entries(codePapCounts).forEach(([code, rows]) => {
      if (rows.length > 1) {
        this.validationErrors.push({
          type: 'DUPLICATE_CODE',
          message: `Le codePap "${code}" est dupliqué`,
          rows: rows,
          severity: 'error'
        });
      }
    });
  }

  validateStatutCompletion() {
    const validStatuts = ['a_completer', 'complet'];
    
    // Compter les PAP à compléter
    const toCompleteCount = this.dataExcel.filter(row => {
      const statut = (row['statutCompletion'] || '').toString().toLowerCase().trim();
      return statut === '' || statut === 'a_completer' || !statut;
    }).length;

    if (toCompleteCount > 0) {
      this.validationErrors.push({
        type: 'TO_COMPLETE_INFO',
        message: `${toCompleteCount} PAP avec statut "à compléter" - Les données seront complétées lors de la mise en œuvre`,
        severity: 'info'
      });
    }

    // Valider format statutCompletion si présent
    if (this.headings.includes('statutCompletion')) {
      const invalidRows = this.dataExcel
        .map((row, index) => {
          const statut = (row['statutCompletion'] || '').toString().toLowerCase().trim();
          if (statut === '') return null; // Vide = ok, sera mis à "a_completer"
          return validStatuts.includes(statut) ? null : index + 1;
        })
        .filter(index => index !== null);

      if (invalidRows.length > 0) {
        this.validationErrors.push({
          type: 'INVALID_STATUS',
          message: 'statutCompletion invalide (valeurs: "a_completer" ou "complet")',
          rows: invalidRows,
          severity: 'warning'
        });
      }
    }
  }

  hasErrors(): boolean {
    return this.validationErrors.some(e => e.severity === 'error');
  }

  hasWarnings(): boolean {
    return this.validationErrors.some(e => e.severity === 'warning');
  }

  hasInfos(): boolean {
    return this.validationErrors.some(e => e.severity === 'info');
  }

  getErrorMessages(): string[] {
    return this.validationErrors
      .filter(e => e.severity === 'error')
      .map(error => this.formatErrorMessage(error));
  }

  getWarningMessages(): string[] {
    return this.validationErrors
      .filter(e => e.severity === 'warning')
      .map(error => this.formatErrorMessage(error));
  }

  getInfoMessages(): string[] {
    return this.validationErrors
      .filter(e => e.severity === 'info')
      .map(error => this.formatErrorMessage(error));
  }

  formatErrorMessage(error: any): string {
    if (error.rows && error.rows.length <= 5) {
      return `${error.message} (Lignes: ${error.rows.join(', ')})`;
    } else if (error.rows && error.rows.length > 5) {
      return `${error.message} (${error.rows.length} lignes affectées)`;
    }
    return error.message;
  }

  getRowClass(row: any): string {
    const statut = (row['statutCompletion'] || '').toString().toLowerCase().trim();
    if (statut === '' || statut === 'a_completer' || !statut) {
      return 'bg-orange-50 border-l-4 border-orange-300';
    } else if (statut === 'complet') {
      return 'bg-green-50 border-l-4 border-green-300';
    }
    return '';
  }
}