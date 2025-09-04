import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { LocalService } from "src/app/core/services/local.service";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { environment } from "src/environments/environment";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Image } from "src/app/shared/models/image.model";
import {provideNativeDateAdapter} from '@angular/material/core';
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

@Component({
  selector: "app-add-rencontre",
  standalone: true,
  imports: [AngularMaterialModule, LoaderComponent],
  providers: [provideNativeDateAdapter()],
  templateUrl: "./add-rencontre.component.html",
  styleUrl: "./add-rencontre.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRencontreComponent {
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " une rencontre";
  countries: any;

  pageSize: number = 100;
  pageIndex: number = 0;

  imageToff: any;

  imageProjet: any;

  loader: boolean;
  action: string;
  canAdd: boolean;
  dataCheck;
  noImage = "";
  errorCNI;
  newDate = new Date();
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  ng2TelOptions;
  uploadedImage!: File;
  urlImage = environment.apiUrl + "fileMinios/upload/";

  roles: any[] = [];
  categories: any[] = [];
  profils: any[] = [];

  url: string = "rencontres";

  constructor(
    public matDialogRef: MatDialogRef<AddRencontreComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private localService: LocalService,
    private clientServive: ClientVueService,
  ) {
    this.currentUser = this.localService.getDataJson("user");

    console.log("user connecter", this.currentUser);
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.imageToff = _data.data.urlDocument;
      this.id = _data.data.id;
      this.initForms(_data.data);

    }

    this.action = _data?.action;
    this.canAdd = _data.canAdd;
    this.dialogTitle = this.labelButton + this.suffixe;
    this.ng2TelOptions = { initialCountry: "sn" };
  }





  currentUser: any;
  ngOnInit(): void {
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      libelle: this.fb.control(donnees ? donnees?.libelle : null, [
        Validators.required,
      ]),
      urlPvRencontre: this.fb.control(
        donnees ? this.urlImage + donnees?.urlPvRencontre : this.urlImage,
        [Validators.required]
      ),
      projectId: this.fb.control(
        this.currentUser.projects ? this.currentUser.projects[0]?.id : null,
        [Validators.required]
      ),

      date: this.fb.control(donnees ? donnees?.date : null, [
        Validators.required,
      ]),
    });
  }

  get phoneValue() {
    return this.initForm.controls["numeroTelephonePersonneContact"];
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
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier cette rencontre `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService.updateItem(value, this.id, this.url).subscribe(
            (resp) => {
              if (resp) {
                this.loader = false;
                this.matDialogRef.close(resp);
                this.snackbar.openSnackBar(
                  "Rencontre  modifieé avec succés",
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

  checkRecap(type) {
    if (type == "new") {
      this.addItems();
    } else if (type == "edit") {
      this.updateItems();
    }
  }


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

  addItems() {
    console.log(this.initForm.value);


    if(this.initForm.valid){
      this.snackbar
      .showConfirmation(`Voulez-vous vraiment ajouter cette rencontre `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          this.coreService.addItem(this.initForm.value, this.url).subscribe(
            (resp) => {
              if (resp["responseCode"] == 201) {
                this.snackbar.openSnackBar(
                  "Rencontre  ajouteé avec succés",
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
              this.snackbar.showErrors(error);
            }
          );
        }
      });
    }

  }

  selectOnFile(evt) {
    let accept = [];
    let extension = "un fichier";
    accept = [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG", ".gif"];
    extension = "une image";
    const acceptDocuments = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    const extensionDocuments = "un document";

    for (const file of evt.target.files) {
      const index = file.name.lastIndexOf(".");
      const strsubstring = file.name.substring(index, file.name.length);
      const fileExtension = strsubstring.toLowerCase();

      if (
        accept.indexOf(fileExtension) === -1 &&
        acceptDocuments.indexOf(fileExtension) === -1
      ) {
        this.snackbar.openSnackBar(
          "Ce fichier " +
            file.name +
            " n'est pas " +
            extension +
            " ou " +
            extensionDocuments,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.snackbar.openSnackBar(
          "Le fichier " +
            file.name +
            " est trop volumineux. La taille maximale est de 10 Mo.",
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      }

      // Si tout est valide, lire le fichier
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (
          fileExtension === ".png" ||
          fileExtension === ".jpg" ||
          fileExtension === ".jpeg" ||
          fileExtension === ".gif"
        ) {
          const img = new Image();
          img.src = e.target.result;
        }
        this.saveStoreFile(file);
      };
      reader.readAsDataURL(file);
    }
  }

  saveStoreFile(file) {
    let formData = new FormData();
    formData.append("file", file);
    this.loader = true;
    this.clientServive
      .saveStoreFile(formData)
      .subscribe(
        (resp) => {
          if (resp) {
            this.imageToff = `${this.urlImage + resp["fileName"]}`;
            this.imageProjet = `${this.urlImage + resp["fileName"]}`;
            this.initForm.get("urlPvRencontre").setValue(this.imageProjet);
            this.snackbar.openSnackBar(
              "Fichier chargé avec succès : " + file.name,
              "OK",
              ["mycssSnackbarGreen"]
            );
          }
          this.loader = false;
        },
        (error) => {
          this.snackbar.showErrors(error);
          this.loader = false;
        }
      );
  }




    openImageModal() {
      if (this.imageProjet) {
        this.dialog.open(ImageModalComponent, {
          data: { imageUrl: this.imageProjet },
        });
      }
    }


}

