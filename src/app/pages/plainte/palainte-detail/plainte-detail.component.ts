import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  ViewEncapsulation,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";

interface Plainte {
  id: number;
  numeroDossier: string;
  lieuEnregistrement: string;
  dateEnregistrement: string;
  libelleProjet: string;
  isRecensed: boolean;
  isSignedFileRecensement: boolean;
  dateRecensement: string;
  natureBienAffecte: string;
  emplacementBienAffecte: string;
  typeIdentification: string;
  numeroIdentification: string;
  projectId: number | null;
  contact: string;
  prenom: string;
  nom: string;
  codePap: string;
  vulnerabilite: string;
  email: string;
  situationMatrimoniale: string;
  descriptionObjet: string;
  hasDocument: boolean;
  recommandation: string;
  etat: string;
  documentUrls: string[];
  urlSignaturePap: string;
  urlSignatureResponsable: string;
}

@Component({
  selector: "app-pap-detail",
  templateUrl: "./plainte-detail.component.html",
  standalone: true,
  imports: [AngularMaterialModule,MatIconModule],
  styleUrl: "./plainte-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlainteDetailComponent {
  plainte: Plainte;

  constructor(
    public matDialogRef: MatDialogRef<PlainteDetailComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) _data
  ) {
    this.plainte = _data.data;
  }
}
