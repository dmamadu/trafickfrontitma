import { ChangeDetectorRef, Component, Inject, ViewChild } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { LocalService } from "src/app/core/services/local.service";
import { MoService } from "src/app/core/services/mo.service";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { ClientVueService } from "src/app/pages/admin/client-vue/client-vue.service";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { environment } from "src/environments/environment";
import { AddUserComponent } from "../../../utilisateur/add-user/add-user.component";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { Image } from "src/app/shared/models/image.model";
import { LoaderComponent } from "../../../../../shared/loader/loader.component";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

@Component({
  selector: "app-add-dossier",
  standalone: true,
  imports: [AngularMaterialModule, LoaderComponent],
  templateUrl: "./add-dossier.component.html",
  styleUrl: "./add-dossier.component.css",
})
export class AddDossierComponent {
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " un dossier";
  countries: any;

  pageSize: number = 100;
  pageIndex: number = 0;

  imageToff: any;
  imageProjet: any;

  nrSelect;
  loader: boolean;
  action: string;
  canAdd: boolean;
  noImage = "";
  errorCNI;
  newDate = new Date();
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  ng2TelOptions;
  categoriePartieInteresses: any;
  uploadedImage!: File;
  imageURL: string | undefined;
  urlImage = environment.apiUrl + "fileMinios/upload/";

  roles: any[] = [];
  categories: any[] = [];
  profils: any[] = [];

  url: string = "documents";

  constructor(
    public matDialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private _matDialog: MatDialog,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private moservice: MoService,
    private localService: LocalService,
    private clientServive: ClientVueService,
    private parentService: ServiceParent
  ) {
    this.currentProjectId = this.localService.getData("ProjectId");

    console.log("user connecter", this.currentProjectId);
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

  currentProjectId: any;
  ngOnInit(): void {
    this.getCategorieItems();
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      libelle: this.fb.control(donnees ? donnees?.libelle : null, [
        Validators.required,
      ]),
      urlDocument: this.fb.control(
        donnees ? this.urlImage + donnees?.urlDocument : this.urlImage,
        [Validators.required]
      ),
      projetId: this.fb.control(
        this.currentProjectId ? +this.currentProjectId : null,
        [Validators.required]
      ),

      categorieDocumentId: this.fb.control(
        donnees ? donnees?.categorie.id : null,
        [Validators.required]
      ),
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
    console.log(this.initForm.value);

    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment modifier ce document `)
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
                    "document  modifié avec succés",
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
    // this.initForm.get("projetId").setValue(1);
  }

  checkRecap(type) {
    if (type == "new") {
      this.addItems();
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

  savedocument() {
    if (this.uploadedImage) {
      return this.moservice
        .uploadImage(this.uploadedImage, this.uploadedImage.name)
        .subscribe((ima: Image) => {
          this.addItems();
        });
    } else {
      return this.addItems();
    }
  }

  addItems() {
    console.log(this.initForm.value);
    // this.initForm.get("projetId").setValue(1);

    if (this.initForm.valid) {
      this.snackbar
        .showConfirmation(`Voulez-vous vraiment ajouter ce document `)
        .then((result) => {
          if (result["value"] == true) {
            this.loader = true;
            // const value = documentRequest;
            this.coreService.addItem(this.initForm.value, this.url).subscribe(
              (resp) => {
                if (resp["responseCode"] == 201) {
                  this.snackbar.openSnackBar(
                    "document  ajouté avec succés",
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
    this.clientServive.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          this.imageToff = `${this.urlImage + resp["fileName"]}`;
          this.imageProjet = `${this.urlImage + resp["fileName"]}`;
          this.initForm.get("urlDocument").setValue(this.imageProjet);
          this.snackbar.openSnackBar(
            "Fichier chargé avec succès : " + file.name,
            "OK",
            ["mycssSnackbarGreen"]
          );
        }
        this.loader = false;
      },
      (error) => {
        this.loader = false;

        this.snackbar.showErrors(error);
      }
    );
  }

  getCategorieItems() {
    return this.parentService
      .list("categorieDocuments", this.pageSize, this.pageIndex)
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

  openImageModal(imageUrl: string) {
    if (imageUrl) {
      this._matDialog.open(ImageModalComponent, {
        data: { imageUrl: imageUrl },
      });
    }
  }
}
