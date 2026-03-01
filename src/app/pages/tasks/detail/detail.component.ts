import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DialogHeaderComponent } from "src/app/shared/refactore/dialog-header/dialog-header.component";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    DialogHeaderComponent,
  ],
})
export class DetailComponent implements OnInit {

  tache: any;

  private readonly STATUT_LABELS: Record<string, string> = {
    "en-attente": "En attente",
    "approuve":   "Approuvé",
    "en-cours":   "En cours",
    "complete":   "Complété",
  };

  constructor(
    public matDialogRef: MatDialogRef<DetailComponent>,
    @Inject(MAT_DIALOG_DATA) _data: any
  ) {
    this.tache = _data.data;
  }

  ngOnInit(): void {}

  formatStatut(statut: string): string {
    return this.STATUT_LABELS[statut] ?? statut;
  }

  getImageFromBase64(imageType: string, imageData: number[]): string {
    return `data:${imageType};base64,${imageData}`;
  }
}