import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-image-modal",
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  styles: `.close-button {
    color: red;
  }

  .close-button:hover {
    color: darkred;
  }`,
  template: `
    <div class="d-flex justify-between items-center">
      <h2 mat-dialog-title>Visualisation de l'image</h2>
      <mat-dialog-actions>
        <button mat-icon-button (click)="closeModal()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </mat-dialog-actions>
    </div>
    <mat-dialog-content class="text-center">
      <img
        [src]="data.imageUrl"
        class="img-fluid"
        alt="Image en grand"
        style="max-width: 800px; height:auto "
      />
    </mat-dialog-content>
  `,
})
export class ImageModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
    private dialogRef: MatDialogRef<ImageModalComponent>
  ) {}

  closeModal() {
    this.dialogRef.close();
  }
}
