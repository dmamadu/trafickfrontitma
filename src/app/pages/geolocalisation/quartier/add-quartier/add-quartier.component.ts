import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";

@Component({
  selector: "app-add-quartier",
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, AngularMaterialModule],
  providers: [SnackBarService],
  templateUrl: "./add-quartier.component.html",
  styleUrl: "./add-quartier.component.css",
})
export class AddQuartierComponent implements OnInit {
  dialogTitle: string;
  labelButton: string;
  action: string;
  id: number;
  initForm: UntypedFormGroup;
  loader = false;

  constructor(
    public matDialogRef: MatDialogRef<AddQuartierComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this._data?.action === "new") {
      this.labelButton = "Ajouter";
      this.action = "new";
      this.initForms();
    } else {
      this.labelButton = "Modifier";
      this.action = "edit";
      this.id = this._data?.data?.id ?? this._data?.id;
      this.initForms(this._data?.data ?? this._data);
    }
    this.dialogTitle = `${this.labelButton} un quartier`;
  }

  initForms(data?: any): void {
    this.initForm = this.fb.group({
      nom: [data?.nom ?? null, [Validators.required, Validators.minLength(2)]],
      latitudeCentre: [data?.latitudeCentre ?? null, [Validators.required]],
      longitudeCentre: [data?.longitudeCentre ?? null, [Validators.required]],
    });
  }

  checkRecap(): void {
    if (this.action === "new") {
      this.addItem();
    } else {
      this.updateItem();
    }
  }

  addItem(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment créer ce quartier ?").then((result) => {
      if (result["value"] === true) {
        this.loader = true;
        this.coreService.addItem(this.initForm.value, "geolocation/quartiers").subscribe(
          (resp: any) => {
            this.loader = false;
            if (resp["responseCode"] === 201) {
              this.snackbar.openSnackBar("Quartier créé avec succès", "OK", ["mycssSnackbarGreen"]);
              this.matDialogRef.close(resp["data"]);
            } else {
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
            this.cdr.markForCheck();
          },
          (error) => {
            this.loader = false;
            this.snackbar.showErrors(error);
            this.cdr.markForCheck();
          }
        );
      }
    });
  }

  updateItem(): void {
    if (this.initForm.invalid) {
      this.initForm.markAllAsTouched();
      return;
    }
    this.snackbar.showConfirmation("Voulez-vous vraiment modifier ce quartier ?").then((result) => {
      if (result["value"] === true) {
        this.loader = true;
        this.coreService.updateItem(this.initForm.value, this.id, "geolocation/quartiers").subscribe(
          (resp: any) => {
            this.loader = false;
            if (resp["responseCode"] === 200) {
              this.snackbar.openSnackBar("Quartier modifié avec succès", "OK", ["mycssSnackbarGreen"]);
              this.matDialogRef.close(resp["data"]);
            } else {
              this.snackbar.openSnackBar(resp["message"], "OK", ["mycssSnackbarRed"]);
            }
            this.cdr.markForCheck();
          },
          (error) => {
            this.loader = false;
            this.snackbar.showErrors(error);
            this.cdr.markForCheck();
          }
        );
      }
    });
  }
}
