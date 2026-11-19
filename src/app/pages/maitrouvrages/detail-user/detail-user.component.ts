import { resolveUserImageUrl } from "src/app/shared/utils/user-image";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { DialogHeaderComponent } from "src/app/shared/refactore/dialog-header/dialog-header.component";

@Component({
  selector: "app-detail-user",
  standalone: true,
  imports: [AngularMaterialModule, DialogHeaderComponent],
  templateUrl: "./detail-user.component.html",
  styleUrl: "./detail-user.component.css",
})
export class DetailUserComponent  implements OnInit {
  /** imageUrl peut être une URL complète ou un nom de fichier MinIO. */
  get photoUrl(): string {
    return resolveUserImageUrl((this as any).user?.imageUrl);
  }


  user: any;

  constructor(
    public matDialogRef: MatDialogRef<DetailUserComponent>,
    @Inject(MAT_DIALOG_DATA) _data
  ) {
    console.log("infos recuperes");

    console.log(_data.data);

    this.user=_data.data
  }
  ngOnInit(): void {
  }
}
