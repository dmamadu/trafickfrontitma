import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";

@Component({
  selector: "app-detail-user",
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: "./detail-user.component.html",
  styleUrl: "./detail-user.component.css",
})
export class DetailUserComponent  implements OnInit {

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
