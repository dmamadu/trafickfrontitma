import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { AddComponent } from "src/app/pages/tasks/add/add.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";

@Component({
  selector: "app-add-categorie",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AngularMaterialModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "fr-FR" },
    { provide: MatPaginatorIntl },
    SnackBarService,
    MatDatepickerModule,
  ],
  templateUrl: "./add-categorie.component.html",
  styleUrl: "./add-categorie.component.css",
})
export class AddCategorieComponent {
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une entité";
  loader: boolean;
  action: string;
  loaderss = false;
  canAdd: boolean;

  ngOnInit(): void {}
  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
    }

    this.action = _data?.action;
    this.canAdd = _data.canAdd;
    this.dialogTitle = this.labelButton + this.suffixe;
  }

  currentUser: any;

  initForms(donnees?) {
    this.initForm = this.fb.group({
      libelle: this.fb.control(donnees ? donnees?.libelle : null, [
        Validators.required,
      ]),
    });
  }

  checkValidity(g: UntypedFormGroup) {
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsDirty();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).markAsTouched();
    });
    Object.keys(g.controls).forEach((key) => {
      g.get(key).updateValueAndValidity();
    });
  }

  updateCategorie() {
    console.log(this.initForm.value);

    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment modifier cette entité `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.updateItem(value, this.id, "categories").subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    "Entité  modifié avec succés",
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                } else {
                  this.loader = false;
                  this.snackbar.openSnackBar(resp["message"], "OK", [
                    "mycssSnackbarRed",
                  ]);
                }
              },
              (error) => {
                this.loader = false;
                this.loader = false;
                this.snackbar.showErrors(error);
              }
            );
          }
        });
    }
  }

  checkRecap(type) {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updateCategorie();
    }
  }

  //file sun telecom

  fileSelected;
  loaderImg = false;

  savePlainte() {
    console.log(this.initForm.value);
    return this.addItems();
  }

  addItems() {
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment crée cette entité `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.addItem(value, "categories").subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar(
                    "Entité  ajoutée avec succés",
                    "OK",
                    ["mycssSnackbarGreen"]
                  );
                  this.loader = false;
                  this.matDialogRef.close(resp["data"]);
                  this.changeDetectorRefs.markForCheck();
                } else {
                  this.loader = false;
                  this.changeDetectorRefs.markForCheck();
                }
              },
              (error) => {
                this.loader = false;
                console.log("====================================");
                console.log(error);
                console.log("====================================");
                this.changeDetectorRefs.markForCheck();
                this.snackbar.showErrors(error);
              }
            );
          }
        });
    }
  }
}
