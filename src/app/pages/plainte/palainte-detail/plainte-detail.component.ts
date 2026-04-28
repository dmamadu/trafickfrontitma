import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject,
  ViewEncapsulation,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Plainte } from "../plainte.model";

@Component({
  selector: "app-plainte-detail",
  templateUrl: "./plainte-detail.component.html",
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, MatIconModule],
  styleUrl: "./plainte-detail.component.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlainteDetailComponent {
  plainte: Plainte;

  constructor(
    public matDialogRef: MatDialogRef<PlainteDetailComponent>,
    @Inject(MAT_DIALOG_DATA) _data: any
  ) {
    this.plainte = _data.data ?? _data;
  }

  getStatutClass(statut?: string): string {
    if (statut === "FERMEE") return "badge bg-success";
    if (statut === "EN COURS") return "badge bg-warning text-dark";
    if (statut === "OUVERTE") return "badge bg-primary";
    return "badge bg-secondary";
  }

  getGraviteClass(gravite?: string): string {
    if (["Elevé", "ELEVE", "Eléve"].includes(gravite ?? "")) return "badge bg-danger";
    if (gravite === "Moyen") return "badge bg-warning text-dark";
    if (gravite === "Faible") return "badge bg-success";
    return "badge bg-secondary";
  }
}
