import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { UIModule } from "src/app/shared/ui/ui.module";

interface PerteRecolte {
  produit: string;
  rendement: number;
  prix: number;
}

interface PerteArbre {
  espece: string;
  type: string;
  nombre: number;
  prix: number;
  total: number;
}

interface PerteRevenue {
  categorieRevenue: string;
  perteRevenue: string;
}

interface PerteEquipement {
  libelle: string;
  nombre: number;
  prix: number;
}

interface Compensation {
  id: number;
  codePap: string;
  categoriePap: string;
  prenom: string;
  nom: string;
  sexe: string;
  departement: string;
  commune: string;
  nationalite: string;
  typePni: string;
  numeroPni: string;
  urlSignaturePap: string;
  urlSignatureResponsable: string;
  fraisDeplacement: number;
  appuiRelocalisation: number;
  fraisTotalDeplacement: number;
  superficieAffecte: number;
  baremeTypeSol: number;
  perteTotalTerre: number;
  perteTotale: number;
  perteRecoltes: PerteRecolte[];
  perteArbres: PerteArbre[];
  perteRevenues: PerteRevenue[];
  perteEquipements: PerteEquipement[];
}

@Component({
  selector: "app-compensation-detail",
  standalone: true,
  imports: [AngularMaterialModule,UIModule,CommonModule,MatIconModule],
  templateUrl: "./compensation-detail.component.html",
  styleUrl: "./compensation-detail.component.css",
})
export class CompensationDetailComponent {
  compensation: Compensation;

  constructor(
    public matDialogRef: MatDialogRef<CompensationDetailComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) _data
  ) {
    const convertedData = this.convertStringToJson(_data.data);
    this.compensation = convertedData;
  }

  private convertStringToJson(data: any): any {
    const keysToConvert = [
      "perteRecoltes",
      "perteArbres",
      "perteRevenues",
      "perteEquipements",
    ];
    keysToConvert.forEach((key) => {
      if (data[key] && typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch (error) {
          console.error(
            `Erreur lors de la conversion de la clé ${key} :`,
            error
          );
          data[key] = [];
        }
      }
    });

    return data;
  }
}
