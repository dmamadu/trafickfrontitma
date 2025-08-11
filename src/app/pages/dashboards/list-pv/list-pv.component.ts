import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";

@Component({
  selector: "app-list-pv",
  standalone:true,
  imports:[AngularMaterialModule],
  templateUrl: "./list-pv.component.html",
  styleUrl: "./list-pv.component.css",
})
export class ListPvComponent implements OnInit {
  references: string;
  constructor(
    public matDialogRef: MatDialogRef<ListPvComponent>,
    @Inject(MAT_DIALOG_DATA) _data
  ) {
    this.references = _data.data;
    console.log('====================================');
    console.log(this.references);
    console.log('====================================');
  }
  ngOnInit(): void {}
}
