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
import { ServiceParent } from "src/app/core/services/serviceParent";
import { AddComponent } from "src/app/pages/tasks/add/add.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";

@Component({
  selector: "app-add-fonction-utilisateur",
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
  templateUrl: "./add-fonction-utilisateur.component.html",
  styleUrl: "./add-fonction-utilisateur.component.css",
})
export class AddFonctionUtilisateurComponent {
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une fonction";
  loader: boolean;
  action: string;
  loaderss = false;
  canAdd: boolean;
  categories: any[] = [];

  ngOnInit(): void {
    this.getCatgories();
  }
  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private parentService: ServiceParent,
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
      categorieId: this.fb.control(donnees ? donnees?.categorie.id : null, [
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

  updatePlainte() {
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment modifier cette fonction `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.updateItem(value, this.id, "fonctions").subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    "Role  modifié avec succés",
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
      this.updatePlainte();
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
        .showConfirmation(`Voulez-vous vraiment crée cette fonction `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.addItem(value, "fonctions").subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar(
                    "Fonction  ajoutée avec succés",
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

  getCatgories() {
    return this.parentService.list("categories", 1000, 0).subscribe(
      (data: any) => {
        if (data["responseCode"] == 200) {
          console.log(data);
          this.categories = data["data"];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
