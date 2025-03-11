import { ChangeDetectorRef, Component, Inject, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { Image } from "src/app/shared/models/image.model";
import { LocalService } from "src/app/core/services/local.service";
import { environment } from "src/environments/environment";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { LoaderComponent } from "../../../../shared/loader/loader.component";

@Component({
  selector: "app-add-user",
  templateUrl: "./add-user.component.html",
  styleUrl: "./add-user.component.css",
  standalone: true,
  imports: [AngularMaterialModule, LoaderComponent],
})
export class AddUserComponent {
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " un utilisateur";
  countries: any;

  pageSize: number = 100;
  pageIndex: number = 0;

  loader: boolean;
  action: string;
  dataCheck;
  url = "users";
  noImage = "";
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  categoriePartieInteresses: any;
  uploadedImage!: File;
  imageURL: string | undefined;

  urlImage = environment.apiUrl + "fileAws/download/";

  roles: any[] = [];
  categories: any[] = [];
  profils: any[] = [];

  constructor(
    public matDialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private clientServive: ClientVueService,
    private parentService: ServiceParent
  ) {
    this.currentUser = this.localService.getDataJson("user");

    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.imageToff = _data.data.imageUrl;
      // this.id = _data.data.id;
      this.initForms(_data.data);
    }

    this.action = _data?.action;
    this.dialogTitle = this.labelButton + this.suffixe;
  }

  currentUser: any;
  ngOnInit(): void {
    this.getCategorieItems();
    this.getFonctions();
    this.getRole();
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      lastname: this.fb.control(donnees?.lastname ?? null, [
        Validators.required,
      ]),
      firstname: this.fb.control(donnees?.firstname ?? null, [
        Validators.required,
      ]),
      email: this.fb.control(donnees?.email ?? null, [
        Validators.required,
        Validators.email,
      ]),
      locality: this.fb.control(donnees?.locality ?? null, [
        Validators.required,
      ]),

      project_id: this.fb.control(this.currentUser.projects?.[0]?.id ?? null, [
        Validators.required,
      ]),
      role_id: this.fb.control(donnees?.roles?.[0]?.id ?? null, [
        Validators.required,
      ]),
      imageUrl: this.fb.control(
        donnees?.imageUrl ? this.urlImage + donnees.imageUrl : null,
        [Validators.required]
      ),
      contact: this.fb.control(donnees?.contact ?? null, [Validators.required]),
      categorie_id: this.fb.control(donnees?.categorie?.id ?? null, [
        Validators.required,
      ]),
      fonction_id: this.fb.control(donnees?.fonction?.id ?? null, [
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

  updateItems() {
    //  console.log(this.initForm.value);
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier cet utilisateur `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.updateItem(value, this.id, "users").subscribe(
            (resp) => {
              if (resp) {
                this.loader = false;
                this.matDialogRef.close(resp);
                this.snackbar.openSnackBar("User  modifié avec succés", "OK", [
                  "mycssSnackbarGreen",
                ]);
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

  checkRecap(type) {
    if (type == "new") {
      this.saveConsultant();
    } else if (type == "edit") {
      this.updateItems();
    }
  }

  getCategorie(value: any) {
    if (this.categoriePartieInteresses) {
      const liste = this.categoriePartieInteresses.filter(
        (type) => type.id == value
      );
      return liste.length != 0 ? liste[0]?.libelle : value;
    }
  }

  //file sun telecom

  fileSelected;
  loaderImg = false;

  deleteImage() {
    document
      .getElementById("member-img")
      .setAttribute("src", "assets/images/users/user-dummy-img.jpg");
    const inputElement = document.getElementById(
      "member-image-input"
    ) as HTMLInputElement;
    inputElement.value = "";
    this.uploadedImage = null;
  }

  saveConsultant() {
    this.addItems();
  }

  addItems() {
    console.log(this.initForm.value);
    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment ajouter cet utilisateur `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            const value = this.initForm.value;
            this.coreService.addItem(value, "users/createUser").subscribe(
              (resp) => {
                if (resp["status"] == 200) {
                  this.snackbar.openSnackBar(
                    "Utilisateur  ajouté avec succés",
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
                this.changeDetectorRefs.markForCheck();
                this.snackbar.openSnackBar(
                  "Une erreur s'est produite , veillez réessayez",
                  "OK",
                  ["mycssSnackbarRed"]
                );
                //  this.snackbar.showErrors(error);
              }
            );
          }
        });
    }
  }

  selectOnFile(evt, type, name) {
    let accept = [];
    let extension = "";
    if (type === "photo_profile") {
      accept = [".png", ".PNG", ".jpg", ".JPG"];
      extension = "une image";
    }
    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const ext = strsubstring;
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (type === "photo_profile") {
            const img = new Image();
            img.src = e.target.result;
            this.saveStoreFile(file);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  imageToff: any;

  saveStoreFile(file) {
    let formData = new FormData();
    formData.append("file", file);
    this.changeDetectorRefs.detectChanges();
    const dataFile = { file: file };
    this.loader = true;
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          console.log(resp);
          this.imageToff = `${this.urlImage + resp["data"]}`;
          this.initForm.get("imageUrl").setValue(this.imageToff);
          this.snackbar.openSnackBar("Image ajoutée avec succés", "OK", [
            "mycssSnackbarGreen",
          ]);
        }
        this.loader = false;
      },
      (error) => {
        this.loader = false;
        console.log(error);
        this.snackbar.showErrors(error);
      }
    );
  }

  getRole() {
    return this.parentService
      .list("roles/all", this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          if (data["responseCode"] == 200) {
            this.roles = data["data"];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getFonctions() {
    return this.parentService
      .list("fonctions", this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          if (data["responseCode"] == 200) {
            this.profils = data["data"];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getCategorieItems() {
    return this.parentService
      .list("categories", this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          if (data["responseCode"] == 200) {
            this.categories = data["data"];
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  filteredProfils: any[] = [];
  onCategoryChange(categorieId: number) {
    this.filteredProfils = this.profils.filter(
      (profil) => profil.categorie.id === categorieId
    );
  }
}
