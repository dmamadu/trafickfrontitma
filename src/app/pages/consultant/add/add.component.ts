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

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrl: "./add.component.css",
  standalone: true,
  imports: [AngularMaterialModule],
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
  urlImage = environment.apiUrl + "image/getFile/";

  constructor(
    public matDialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) _data,
    private fb: UntypedFormBuilder,
    private coreService: CoreService,
    private snackbar: SnackBarService,
    private changeDetectorRefs: ChangeDetectorRef,
    private clientService: ClientVueService,
    private parentService: ServiceParent,
    private moservice: MoService,
    private _matDialog: MatDialog,
    private localService: LocalService,
    private clientServive: ClientVueService
  ) {
    this.currentUser = this.localService.getDataJson("user");

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

      if (imageToEdit) {
        document.querySelectorAll("#member-img").forEach((element: any) => {
          element.src = this.getImageFromBase64(
            imageToEdit.type,
            imageToEdit.image
          );
        });
        const image: any = this.getImageFromBase64(
          imageToEdit.type,
          imageToEdit.image
        );
        const file = this.base64ToFile(image, imageToEdit.name);
        this.uploadedImage = file;
      }
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

  getImageFromBase64(imageType: string, imageName: number[]): string {
    const base64Representation = "data:" + imageType + ";base64," + imageName;
    return base64Representation;
  }

  base64ToFile(base64String: string, fileName: string): File {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }

  currentUser: any;
  ngOnInit(): void {
    this.getPip();
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
        this.currentUser.projects ? this.currentUser.projects[0]?.id : null,
        [Validators.required]
      ),
      sous_role: this.fb.control(donnees ? donnees?.sous_role : null, [
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
    this.clientService.saveStoreFile("store-file", formData).subscribe(
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
    // Logique pour supprimer l'image sélectionnée
    // Par exemple, réinitialisation de l'image à une image par défaut
    document
      .getElementById("member-img")
      .setAttribute("src", "assets/images/users/user-dummy-img.jpg");
    // Réinitialisation de l'input de type fichier pour effacer la sélection
    const inputElement = document.getElementById(
      "member-image-input"
    ) as HTMLInputElement;
    inputElement.value = "";
    this.uploadedImage = null;
  }

  // getPip() {

  //     if (this.lien === "pip/ong") {
  //       return this.parentService
  //         .liste("partie-interesse", this.pageSize, this.offset, "ONG")
  //         .subscribe(
  //           (data: any) => {
  //             this.loadData = false;
  //             if (data["responseCode"] == 200) {
  //               console.log(data);
  //               this.loadData = false;
  //               console.log(data);
  //               this.dataSource = new MatTableDataSource(data["data"]);
  //               this.dataSource.paginator = this.paginator;
  //               this.dataSource.sort = this.sort;
  //               this.datas = data["data"];
  //               this.length = data["length"];
  //               console.log("length", this.length);
  //               this._changeDetectorRef.markForCheck();
  //             } else {
  //               this.loadData = false;
  //               this.dataSource = new MatTableDataSource();
  //             }
  //           },
  //           (err) => {
  //             console.log(err);
  //           }
  //         );
  //     }
  //   }

  organes:any[]=[]
  getPip() {
    this.parentService.list("partie-interesse", 10000, 0).subscribe(
        (data: any) => {
          if (data && data["response"] && data["response"]['data']) {
            console.log(data);
            this.organes = data["response"]['data'];
          } else {
            console.error('La structure de la réponse est incorrecte:', data);
          }
        },
        (error) => {
          // Cette partie se déclenche en cas d'erreur dans l'appel HTTP
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
    console.log(this.initForm.value);
    const consultantRequest = this.initForm.value;
    if (image) {
      consultantRequest.image = image;
    }
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
              this.loader = false;
              this.changeDetectorRefs.markForCheck();
              this.snackbar.showErrors(error);
            }
          );
        }
      });
  }

  //  editUser(id: any) {
  //   this.submitted = false;
  //   this.newContactModal?.show();
  //   var modelTitle = document.querySelector(".modal-title") as HTMLAreaElement;
  //   modelTitle.innerHTML = "Edit Profile";
  //   var updateBtn = document.getElementById(
  //     "addContact-btn"
  //   ) as HTMLAreaElement;
  //   updateBtn.innerHTML = "Update";
  //   this.createMoForm.patchValue(this.listMo[id]);

  //   this.selectedProjects = this.listMo[id].projects;

  //   console.log(this.selectedProjects);
  //   this.updateSelectedProjects();
  // }

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
      // Verification de l'extension du ficihier est valide
      if (accept.indexOf(strsubstring) === -1) {
        this.snackbar.openSnackBar(
          "Ce fichier " + file.name + " n'est " + extension,
          "OK",
          ["mycssSnackbarRed"]
        );
        return;
      } else {
        // recuperation du fichier et conversion en base64
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
    this.clientServive
      .saveStoreFile("image/uploadFileDossier", formData)
      .subscribe(
        (resp) => {
          if (resp) {
            console.log(resp);
            this.imageToff = `${this.urlImage + resp["data"]}`;
            this.initForm.get("imageUrl").setValue(this.imageToff);
            // Fermez le dialogue et renvoyez l'URL de la signature
            // this.matDialogRef.close(signatureUrl);
          }
        },
        (error) => {
          console.log(error);
          this.snackbar.showErrors(error);
        }
      );
  }

  roles: string[] = [
    "Chef de mission",
    "Spécialiste en réinstallation",
    "Spécialiste en gestion des parties prenantes",
    "Spécialiste en Genre et Inclusions Sociale",
    "Spécialiste en base de données et SIG",
    "Animateurs communautaires",
  ];
}
