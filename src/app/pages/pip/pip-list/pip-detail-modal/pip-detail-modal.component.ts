import { Component, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pip-detail-modal',
  templateUrl: './pip-detail-modal.component.html',
  styleUrls: ['./pip-detail-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipDetailModalComponent {
  pap: any;
  categoriePartieInteresses: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PipDetailModalComponent>,
    private cdr: ChangeDetectorRef
  ) {
    this.pap = data.pap;
    this.categoriePartieInteresses = data.categoriePartieInteresses || [];
  }

  close(): void {
    this.dialogRef.close();
  }

  refresh(): void {
    this.dialogRef.close('refresh');
  }

  getCategorieLibelle(categorieId: number): string {
    if (this.categoriePartieInteresses && this.categoriePartieInteresses.length > 0) {
      const categorie = this.categoriePartieInteresses.find(c => c.id === categorieId);
      return categorie ? categorie.libelle : String(categorieId);
    }
    return this.pap.categorie || 'Non spécifié';
  }

  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Baileur principale': 'status-bailleur',
      'Baileur secondaire': 'status-bailleur-secondaire',
      'Partenaire': 'status-partenaire',
      'Fournisseur': 'status-fournisseur'
    };
    return statusMap[statut] || 'status-default';
  }

  edit(): void {
  this.dialogRef.close({ action: 'edit', data: this.pap });
}
}