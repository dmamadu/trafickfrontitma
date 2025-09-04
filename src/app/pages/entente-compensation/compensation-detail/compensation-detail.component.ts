// import { CommonModule } from "@angular/common";
// import { Component, Inject } from "@angular/core";
// import {
//   MAT_DIALOG_DATA,
//   MatDialog,
//   MatDialogRef,
// } from "@angular/material/dialog";
// import { MatIconModule } from "@angular/material/icon";
// import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
// import { ImageModalComponent } from "src/app/shared/image-modal.component";
// import { UIModule } from "src/app/shared/ui/ui.module";

// interface PerteRecolte {
//   produit: string;
//   rendement: number;
//   prix: number;
// }

// interface PerteArbre {
//   espece: string;
//   type: string;
//   nombre: number;
//   prix: number;
//   total: number;
// }

// interface PerteRevenue {
//   categorieRevenue: string;
//   perteRevenue: string;
// }

// interface PerteEquipement {
//   libelle: string;
//   nombre: number;
//   prix: number;
// }

// interface Compensation {
//   id: number;
//   codePap: string;
//   categoriePap: string;
//   prenom: string;
//   nom: string;
//   sexe: string;
//   departement: string;
//   commune: string;
//   nationalite: string;
//   typePni: string;
//   numeroPni: string;
//   urlSignaturePap: string;
//   urlSignatureResponsable: string;
//   fraisDeplacement: number;
//   appuiRelocalisation: number;
//   fraisTotalDeplacement: number;
//   superficieAffecte: number;
//   baremeTypeSol: number;
//   perteTotalTerre: number;
//   perteTotale: number;
//   perteRecoltes: PerteRecolte[];
//   perteArbres: PerteArbre[];
//   perteRevenues: PerteRevenue[];
//   perteEquipements: PerteEquipement[];
// }

// @Component({
//   selector: "app-compensation-detail",
//   standalone: true,
//   imports: [AngularMaterialModule,UIModule,CommonModule,MatIconModule],
//   templateUrl: "./compensation-detail.component.html",
//   styleUrl: "./compensation-detail.component.css",
// })
// export class CompensationDetailComponent {
//   compensation: Compensation;

//   constructor(
//     public matDialogRef: MatDialogRef<CompensationDetailComponent>,
//     private _matDialog: MatDialog,
//     @Inject(MAT_DIALOG_DATA) _data
//   ) {
//     const convertedData = this.convertStringToJson(_data.data);
//     this.compensation = convertedData;
//   }

//   private convertStringToJson(data: any): any {
//     const keysToConvert = [
//       "perteRecoltes",
//       "perteArbres",
//       "perteRevenues",
//       "perteEquipements",
//     ];
//     keysToConvert.forEach((key) => {
//       if (data[key] && typeof data[key] === "string") {
//         try {
//           data[key] = JSON.parse(data[key]);
//         } catch (error) {
//           console.error(
//             `Erreur lors de la conversion de la clé ${key} :`,
//             error
//           );
//           data[key] = [];
//         }
//       }
//     });

//     return data;
//   }


//      openImageModal(imageUrl: string) {
//         if (imageUrl) {
//           this._matDialog.open(ImageModalComponent, {
//             data: { imageUrl: imageUrl },
//           });
//         }
//       }

// }


import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

export interface Compensation {
  ententeId: number;
  statut: string;
  etatProcessus: string;
  perteTerre: number | null;
  superficie: number | null;
  codeParcelle: string | null;
  caracteristiqueParcelle: string | null;
  activitePrincipale: string | null;
  age: number | null;
  papId: number;
  papType: string;
  codePap: string;
  prenom: string;
  nom: string;
  sexe: string;
  categorie: string;
  commune: string;
  departement: string;
  typeFormation: string;
  formateur: string;
  resultatSuivi: string;
  commentairesSuivi: string;
  modeInformation: string;
  detailsInformation: string;
  numeroTelephone: string;
  perteTotale: number;
  fraisDeplacement: number | null;
  appuiRelocalisation: number | null;
  perteRevenue: number | null;
  perteBatiment: number;
  perteLoyer: number | null;
  perteCloture: number | null;
  perteTotaleArbre: number;
  perteArbreJeune: number;
  perteArbreAdulte: number;
  perteEquipement: number;
  optionPaiement: string;
  pointGeometriques: string;
  description: string | null;
  evaluationPerte: string;
  statutPap: string;
  vulnerabilite: string;
  compensationEtablie: boolean;
  papInformee: boolean;
  accordPapObtenu: boolean;
  paiementEffectue: boolean;
  formationDonnee: boolean;
  suiviEffectue: boolean;
  dateCreation: string;
  dateSynchronisation: string;
  dateFinalisation: string | null;
  datePaiement: string;
  dateFormation: string;
  dateSuivi: string;
  dateAccordPap: string;
  dateInformationPap: string;
}

@Component({
  selector: 'app-compensation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './compensation-detail.component.html',
  styleUrls: ['./compensation-detail.component.css']
})
export class CompensationDetailComponent implements OnInit {
  compensation!: Compensation;
  processSteps: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CompensationDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.compensation = this.data.data;
      this.setupProcessSteps();
    }
  }

  private setupProcessSteps(): void {
    this.processSteps = [
      { step: 'Compensation établie', completed: this.compensation.compensationEtablie, date: this.compensation.dateCreation },
      { step: 'PAP informée', completed: this.compensation.papInformee, date: this.compensation.dateInformationPap },
      { step: 'Accord PAP obtenu', completed: this.compensation.accordPapObtenu, date: this.compensation.dateAccordPap },
      { step: 'Paiement effectué', completed: this.compensation.paiementEffectue, date: this.compensation.datePaiement },
      { step: 'Formation donnée', completed: this.compensation.formationDonnee, date: this.compensation.dateFormation },
      { step: 'Suivi effectué', completed: this.compensation.suiviEffectue, date: this.compensation.dateSuivi }
    ];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SYNCHRONISEE': return 'success';
      case 'EN_COURS': return 'primary';
      case 'EN_ATTENTE': return 'warn';
      default: return 'default';
    }
  }

  getProcessStatusColor(status: string): string {
    switch (status) {
      case 'PROCESSUS_TERMINE': return 'success';
      case 'PROCESSUS_EN_COURS': return 'primary';
      default: return 'warn';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}