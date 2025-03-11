import { ChangeDetectorRef, Component, Inject, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { MatStepper } from "@angular/material/stepper";
import { AngularMaterialModule } from "src/app/shared/angular-materiel-module/angular-materiel-module";
import { CoreService } from "src/app/shared/core/core.service";
import { SnackBarService } from "src/app/shared/core/snackBar.service";
import { ClientVueService } from "../../admin/client-vue/client-vue.service";
import { Image } from "src/app/shared/models/image.model";
import { MoService } from "src/app/core/services/mo.service";
import { ResponseData } from "../../projects/project.model";
import { LocalService } from "src/app/core/services/local.service";
import { environment } from "src/environments/environment";
import { ServiceParent } from "src/app/core/services/serviceParent";
import { LoaderComponent } from "../../../shared/loader/loader.component";
import { ImageModalComponent } from "src/app/shared/image-modal.component";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrl: "./add.component.css",
  standalone: true,
  imports: [AngularMaterialModule, LoaderComponent],
})
export class AddComponent {
  panelOpenState = false;
  @ViewChild("drawer") drawer: MatDrawer;
  @ViewChild("stepper") private myStepper: MatStepper;
  dialogTitle: string;
  id: string;
  initForm: UntypedFormGroup;
  labelButton: string;
  suffixe: string = " un consultant";
  countries: any;

  nrSelect;
  situationsMatrimoniales: any;
  typeIdentifications: any = [];
  capaciteJuridiques: any;
  dateDelivrance;
  regimeMatrimoniaux: any;
  professions: any;
  loader: boolean;
  action: string;
  minBirthDay: any;
  today = new Date();
  loaderss = false;
  fields: any;
  canAdd: boolean;
  dataCheck;
  url = "users/createConsultant";
  hasPhoneError: boolean;
  currentValue: any;
  countryChange: boolean = false;
  eventNumber: any;
  isFocus: unknown;
  noImage = "";
  errorCNI;
  newDate = new Date();
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  isValidOnWhatsApp: boolean = true;
  ng2TelOptions;
  idPiece;
  listeNoire: boolean = false;
  categoriePartieInteresses: any;
  uploadedImage!: File;
  imageURL: string | undefined;
  //urlImage = environment.apiUrl + "image/getFile/";

  urlImage = environment.apiUrl + "fileAws/download/";
  currentProjectId: any;
  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private clientService: ClientVueService,
    private parentService: ServiceParent,
    private dialog: MatDialog,
    private moservice: MoService,
    private localService: LocalService,
    private clientServive: ClientVueService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    //this.currentUser = this.localService.getDataJson("user");

    this.currentProjectId = this.localService.getData("ProjectId");

    console.log("user connecter", this.currentUser);
    if (_data?.action == "new") {
      this.initForms();
      this.labelButton = "Ajouter ";
    } else if (_data?.action == "edit") {
      this.labelButton = "Modifier ";
      this.id = _data.data.id;
      this.initForms(_data.data);
      const imageToEdit = _data.data.image;
      // console.log("is",_data.data.image.type);


    }

    this.action = _data?.action;
    this.canAdd = _data.canAdd;
    this.dialogTitle = this.labelButton + this.suffixe;
    this.ng2TelOptions = { initialCountry: "sn" };
  }

  checkValidOnWhatsApp(event: any): void {
    const value = event.value;
    this.initForm.get("statutVulnerable")?.setValue(value);
  }





  currentUser: any;
  ngOnInit(): void {
    this.getPip();
    this.getFonctions();
  }

  initForms(donnees?) {
    this.initForm = this.fb.group({
      lastname: this.fb.control(donnees ? donnees?.lastname : null, [
        Validators.required,
      ]),
      firstname: this.fb.control(donnees ? donnees?.firstname : null, [
        Validators.required,
      ]),
      email: this.fb.control(donnees ? donnees?.email : null, [
        Validators.required,
        Validators.email,
      ]),
      locality: this.fb.control(donnees ? donnees?.locality : null, [
        Validators.required,
      ]),

      project_id: this.fb.control(
        this.currentProjectId ? this.currentProjectId : null,
        [Validators.required]
      ),
      fonction_id: this.fb.control(donnees ? donnees?.fonction_id : null, [
        Validators.required,
      ]),
      partieInteresse_id: this.fb.control(donnees ? donnees?.partieInteresse_id : null, [
        Validators.required,
      ]),
      imageUrl: this.fb.control(donnees ? donnees?.imageUrl : null, [
        Validators.required,
      ]),
      contact: this.fb.control(donnees ? donnees?.contact : null, [
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
    console.log(this.initForm.value);
    if(this.initForm.valid){
      this.snackbar
      .showConfirmation(`Voulez-vous vraiment modifier ce consultant `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = this.initForm.value;
          this.coreService
            .updateItem(value, this.id, "users/updateConsultant")
            .subscribe(
              (resp) => {
                if (resp) {
                  this.loader = false;
                  this.matDialogRef.close(resp);
                  this.snackbar.openSnackBar(
                    "Consultant  modifié avec succés",
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

  saveFile(file, type, name) {
    let formData = new FormData();
    formData.append("file", file);

    this.loaderImg = true;
    this.changeDetectorRefs.detectChanges();
    const dataFile = { file: file };
    this.clientService.saveStoreFile(formData).subscribe(
      (resp) => {
        if (resp) {
          console.log("====================================");
          console.log(resp);
          console.log("====================================");
          this.noImage = resp["urlprod"];
          this.initForm.get(name).setValue(this.noImage);
          this.loaderImg = false;
          this.changeDetectorRefs.detectChanges();
          this.snackbar.openSnackBar("Fichier chargé avec succès", "OK", [
            "mycssSnackbarGreen",
          ]);
        }
      },
      (error) => {
        this.loaderImg = false;
        this.snackbar.showErrors(error);
      }
    );
  }

  // Fin file sun telecom

  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll("#member-img").forEach((element: any) => {
        element.src = this.imageURL;
      });
    };
    reader.readAsDataURL(file);
  }

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

  organes:any[]=[]
  getPip() {
    this.parentService.list("partie-interesse", 10000, 0).subscribe(
        (data: any) => {
          if (data["responseCode"] == 200) {
            console.log(data);
            this.organes = data['data'];
          } else {
            console.error('La structure de la réponse est incorrecte:', data);
          }
        },
        (error) => {
          console.log("Une erreur est survenue lors de la récupération des données.");
        }
      );
  }

  saveConsultant() {
    if (this.uploadedImage) {
      return this.moservice
        .uploadImage(this.uploadedImage, this.uploadedImage.name)
        .subscribe((ima: Image) => {
          this.addItems(ima);
        });
    } else {
      return this.addItems();
    }
  }

  addItems(image?: Image) {
    //this.initForm.get("project_id").setValue(1);
   // console.log(this.initForm.value);

   if(this.initForm.valid){
    const consultantRequest = this.initForm.value;
    // if (image) {
    //   consultantRequest.image = image;
    // }
    this.snackbar
      .showConfirmation(`Voulez-vous vraiment ajouter ce consultant `)
      .then((result) => {
        if (result["value"] == true) {
          this.loader = true;
          const value = consultantRequest;
          this.coreService.addItem(value, "users/createConsultant").subscribe(
            (resp) => {
              if (resp["status"] == 200) {
                this.snackbar.openSnackBar(
                  "Consultant  ajouté avec succés",
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
              console.log(error);

              this.loader = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
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
      accept = [".png", ".PNG", ".jpg", ".JPG",".JPEG",".jpeg"];
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
    this.loader=true;
    this.clientServive
      .saveStoreFile(formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.imageToff = `${this.urlImage + resp["fileName"]}`;
            this.initForm.get("imageUrl").setValue(this.imageToff);
            this.snackbar.openSnackBar(
              "Image chargé avec succées",
              "OK",
              ["mycssSnackbarGreen"]
            );
            // Fermez le dialogue et renvoyez l'URL de la signature
            // this.matDialogRef.close(signatureUrl);
          }
          this.loader=false;
        },
        (error) => {
          this.loader=false;
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }

  roles: string[] = [];


    getFonctions() {
      return this.parentService
        .list('fonctions', 1000, 0)
        .subscribe(
          (data: any) => {
            if (data["responseCode"] == 200) {
              console.log(data);
              this.roles = data["data"];
              this._changeDetectorRef.markForCheck();
            } else {
            }
          },
          (err) => {
            console.log(err);
          }
        );
    }



       openImageModal() {
          if (this.imageToff) {
            this.dialog.open(ImageModalComponent, {
              data: { imageUrl: this.imageToff },
            });
          }
        }
}
