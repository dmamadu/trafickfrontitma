import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogRef } from "@angular/material/dialog";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { LocalService } from "src/app/core/services/local.service";
import { User } from "src/app/store/Authentication/auth.models";

@Component({
  selector: "app-my-profile",
  standalone: true,
  imports: [CommonModule, AngularMaterialModule],
  templateUrl: "./my-profile.component.html",
})
export class MyProfileComponent implements OnInit {
  user: User;

  constructor(
    public dialogRef: MatDialogRef<MyProfileComponent>,
    private localService: LocalService
  ) {}

  ngOnInit(): void {
    this.user = this.localService.getDataJson("user");
  }
}